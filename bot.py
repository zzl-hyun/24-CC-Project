import os
from dotenv import load_dotenv
load_dotenv()
import pyupbit
import pandas as pd
import pandas_ta as ta
import json
from openai import OpenAI
import schedule
import time
import requests
from datetime import datetime
import sqlite3
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import base64

# Setup
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
upbit = pyupbit.Upbit(os.getenv("UPBIT_ACCESS_KEY"), os.getenv("UPBIT_SECRET_KEY"))
db_path = 'trading_decisions.sqlite'

def initialize_db(db_path):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS decisions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME,
                decision TEXT,
                percentage REAL,
                reason TEXT,
                btc_balance REAL,
                krw_balance REAL,
                btc_avg_buy_price REAL,
                btc_krw_price REAL
            );
        ''')
        
        # balance 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS balance (
                currency TEXT PRIMARY KEY,
                balance REAL,
                avg_buy_price REAL
            );
        ''')

        # 초기 KRW 및 BTC 잔액 설정
        cursor.execute("INSERT OR IGNORE INTO balance (currency, balance, avg_buy_price) VALUES ('KRW', 1000000, 0)") # 100만원 
        cursor.execute("INSERT OR IGNORE INTO balance (currency, balance, avg_buy_price) VALUES ('BTC', 0, 0)")
        
        conn.commit()

def save_decision_to_db(decision, current_status):
    db_path = 'trading_decisions.sqlite'
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
    
        # Parsing current_status from JSON to Python dict
        status_dict = json.loads(current_status)
        current_price = pyupbit.get_orderbook(ticker="KRW-BTC")['orderbook_units'][0]["ask_price"]
        
        # Preparing data for insertion
        data_to_insert = (
            decision.get('decision'),
            decision.get('percentage', 100),  # Defaulting to 100 if not provided
            decision.get('reason', ''),  # Defaulting to an empty string if not provided
            status_dict.get('btc_balance'),
            status_dict.get('krw_balance'),
            status_dict.get('btc_avg_buy_price'),
            current_price
        )
        
        # Inserting data into the database
        cursor.execute('''
            INSERT INTO decisions (timestamp, decision, percentage, reason, btc_balance, krw_balance, btc_avg_buy_price, btc_krw_price)
            VALUES (datetime('now', 'localtime'), ?, ?, ?, ?, ?, ?, ?)
        ''', data_to_insert)
    
        conn.commit()

def fetch_last_decisions(db_path, num_decisions=10):
    with sqlite3.connect(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT timestamp, decision, percentage, reason, btc_balance, krw_balance, btc_avg_buy_price FROM decisions
            ORDER BY timestamp DESC
            LIMIT ?
        ''', (num_decisions,))
        decisions = cursor.fetchall()

        if decisions:
            formatted_decisions = []
            for decision in decisions:
                # Converting timestamp to milliseconds since the Unix epoch
                ts = datetime.strptime(decision[0], "%Y-%m-%d %H:%M:%S")
                ts_millis = int(ts.timestamp() * 1000)
                
                formatted_decision = {
                    "timestamp": ts_millis,
                    "decision": decision[1],
                    "percentage": decision[2],
                    "reason": decision[3],
                    "btc_balance": decision[4],
                    "krw_balance": decision[5],
                    "btc_avg_buy_price": decision[6]
                }
                formatted_decisions.append(str(formatted_decision))
            return "\n".join(formatted_decisions)
        else:
            return "No decisions found."

def get_current_status():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 초기 변수 설정
    btc_balance = 0
    krw_balance = 0
    btc_avg_buy_price = 0

    try:
        # balance 테이블에서 최신 잔액 및 평균 매수 단가 조회
        cursor.execute("SELECT balance, avg_buy_price FROM balance WHERE currency = 'BTC'")
        btc_data = cursor.fetchone()
        if btc_data:
            btc_balance, btc_avg_buy_price = btc_data

        cursor.execute("SELECT balance FROM balance WHERE currency = 'KRW'")
        krw_data = cursor.fetchone()
        if krw_data:
            krw_balance = krw_data[0]

        # 현재 BTC-KRW 가격 조회
        orderbook = pyupbit.get_orderbook(ticker="KRW-BTC")
        btc_krw_price = orderbook['orderbook_units'][0]["ask_price"]
        current_time = datetime.fromtimestamp(orderbook['timestamp'] / 1000).strftime('%Y-%m-%d %H:%M:%S')

    except Exception as e:
        print(f"Failed to get current status: {e}")
        return None
    finally:
        conn.close()

    current_status = {
        'current_time': current_time,
        'btc_balance': btc_balance,
        'krw_balance': krw_balance,
        'btc_avg_buy_price': btc_avg_buy_price,
        'btc_krw_price': btc_krw_price
    }
    return json.dumps(current_status, ensure_ascii=False)

def fetch_and_prepare_data():
    # Fetch data
    df_daily = pyupbit.get_ohlcv("KRW-BTC", "day", count=30)
    df_hourly = pyupbit.get_ohlcv("KRW-BTC", interval="minute60", count=24)

    # Define a helper function to add indicators
    def add_indicators(df):
        # Moving Averages
        df['SMA_10'] = ta.sma(df['close'], length=10)
        df['EMA_10'] = ta.ema(df['close'], length=10)

        # RSI
        df['RSI_14'] = ta.rsi(df['close'], length=14)

        # Stochastic Oscillator
        stoch = ta.stoch(df['high'], df['low'], df['close'], k=14, d=3, smooth_k=3)
        df = df.join(stoch)

        # MACD
        ema_fast = df['close'].ewm(span=12, adjust=False).mean()
        ema_slow = df['close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = ema_fast - ema_slow
        df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
        df['MACD_Histogram'] = df['MACD'] - df['Signal_Line']

        # Bollinger Bands
        df['Middle_Band'] = df['close'].rolling(window=20).mean()
        # Calculate the standard deviation of closing prices over the last 20 days
        std_dev = df['close'].rolling(window=20).std()
        # Calculate the upper band (Middle Band + 2 * Standard Deviation)
        df['Upper_Band'] = df['Middle_Band'] + (std_dev * 2)
        # Calculate the lower band (Middle Band - 2 * Standard Deviation)
        df['Lower_Band'] = df['Middle_Band'] - (std_dev * 2)

        return df

    # Add indicators to both dataframes
    df_daily = add_indicators(df_daily)
    df_hourly = add_indicators(df_hourly)

    combined_df = pd.concat([df_daily, df_hourly], keys=['daily', 'hourly'])
    combined_data = combined_df.to_json(orient='split')

    return json.dumps(combined_data)

def get_news_data():
    ### Get news data from SERPAPI
    url = "https://serpapi.com/search.json?engine=google_news&q=btc&api_key=" + os.getenv("SERPAPI_API_KEY")

    result = "No news data available."

    try:
        response = requests.get(url)
        news_results = response.json()['news_results']

        simplified_news = []
        
        for news_item in news_results:
            # Check if this news item contains 'stories'
            if 'stories' in news_item:
                for story in news_item['stories']:
                    timestamp = int(datetime.strptime(story['date'], '%m/%d/%Y, %H:%M %p, %z %Z').timestamp() * 1000)
                    simplified_news.append((story['title'], story.get('source', {}).get('name', 'Unknown source'), timestamp))
            else:
                # Process news items that are not categorized under stories but check date first
                if news_item.get('date'):
                    timestamp = int(datetime.strptime(news_item['date'], '%m/%d/%Y, %H:%M %p, %z %Z').timestamp() * 1000)
                    simplified_news.append((news_item['title'], news_item.get('source', {}).get('name', 'Unknown source'), timestamp))
                else:
                    simplified_news.append((news_item['title'], news_item.get('source', {}).get('name', 'Unknown source'), 'No timestamp provided'))
        result = str(simplified_news)
    except Exception as e:
        print(f"Error fetching news data: {e}")

    return result

def fetch_fear_and_greed_index(limit=1, date_format=''):
    """
    Fetches the latest Fear and Greed Index data.
    Parameters:
    - limit (int): Number of results to return. Default is 1.
    - date_format (str): Date format ('us', 'cn', 'kr', 'world'). Default is '' (unixtime).
    Returns:
    - dict or str: The Fear and Greed Index data in the specified format.
    """
    base_url = "https://api.alternative.me/fng/"
    params = {
        'limit': limit,
        'format': 'json',
        'date_format': date_format
    }
    response = requests.get(base_url, params=params)
    myData = response.json()['data']
    resStr = ""
    for data in myData:
        resStr += str(data)
    return resStr

def get_current_base64_image():
    screenshot_path = "screenshot.png"
    try:
        # Set up Chrome options for headless mode
        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920x1080")

        service = Service('/usr/local/bin/chromedriver')  # Specify the path to the ChromeDriver executable

        # Initialize the WebDriver with the specified options
        driver = webdriver.Chrome(service=service, options=chrome_options)

        # Navigate to the desired webpage
        driver.get("https://upbit.com/full_chart?code=CRIX.UPBIT.KRW-BTC")

        # Wait for the page to load completely
        wait = WebDriverWait(driver, 10)  # 10 seconds timeout

        # Wait for the first menu item to be clickable and click it
        first_menu_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[@id='fullChartiq']/div/div/div[1]/div/div/cq-menu[1]")))
        first_menu_item.click()

        # Wait for the "1 Hour" option to be clickable and click it
        one_hour_option = wait.until(EC.element_to_be_clickable((By.XPATH, "//cq-item[@stxtap=\"Layout.setPeriodicity(1,60,'minute')\"]")))
        one_hour_option.click()

        # Wait for the indicators menu item to be clickable and click it
        indicators_menu_item = wait.until(EC.element_to_be_clickable((By.XPATH, "//*[@id='fullChartiq']/div/div/div[1]/div/div/cq-menu[3]")))
        indicators_menu_item.click()

        # Wait for the indicators container to be present
        indicators_container = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "cq-scroll.ps-container")))

        # Scroll the container to make the "MACD" indicator visible
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight / 2.5", indicators_container)

        # Wait for the "MACD" indicator to be clickable and click it
        macd_indicator = wait.until(EC.element_to_be_clickable((By.XPATH, "//cq-item[translate[@original='MACD']]")))
        macd_indicator.click()

        # Take a screenshot to verify the actions
        driver.save_screenshot(screenshot_path)
    except Exception as e:
        print(f"Error making current image: {e}")
        return ""
    finally:
        # Close the browser
        driver.quit()
        with open(screenshot_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

def get_instructions(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            instructions = file.read()
        return instructions
    except FileNotFoundError:
        print("File not found.")
    except Exception as e:
        print("An error occurred while reading the file:", e)

def analyze_data_with_gpt4(news_data, data_json, last_decisions, fear_and_greed, current_status, current_base64_image):
    instructions_path = "instructions_v3.md"
    try:
        instructions = get_instructions(instructions_path)
        if not instructions:
            print("No instructions found.")
            return None
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": news_data},
                {"role": "user", "content": data_json},
                {"role": "user", "content": last_decisions},
                {"role": "user", "content": fear_and_greed},
                {"role": "user", "content": current_status},
                {"role": "user", "content": [{"type": "image_url","image_url": {"url": f"data:image/jpeg;base64,{current_base64_image}"}}]}
            ],
            response_format={"type":"json_object"}
        )
        advice = response.choices[0].message.content
        return advice
    except Exception as e:
        print(f"Error in analyzing data with GPT-4: {e}")
        return None

def execute_buy(percentage, reason="Auto trade"):
    print("Attempting to buy BTC with a percentage of KRW balance...")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT balance FROM balance WHERE currency = 'KRW'")
        krw_balance_data = cursor.fetchone()
        if krw_balance_data:
            krw_balance = krw_balance_data[0]
            amount_to_invest = krw_balance * (percentage / 100)

            if amount_to_invest > 5000:
                current_price = pyupbit.get_orderbook(ticker="KRW-BTC")['orderbook_units'][0]["ask_price"]
                btc_to_buy = (amount_to_invest * 0.9995) / current_price

                # 잔액 업데이트
                new_krw_balance = krw_balance - amount_to_invest
                cursor.execute("UPDATE balance SET balance = ? WHERE currency = 'KRW'", (new_krw_balance,))

                cursor.execute("SELECT balance FROM balance WHERE currency = 'BTC'")
                btc_balance_data = cursor.fetchone()
                if btc_balance_data:
                    new_btc_balance = btc_balance_data[0] + btc_to_buy
                    cursor.execute("UPDATE balance SET balance = ?, avg_buy_price = ? WHERE currency = 'BTC'", (new_btc_balance, current_price))
                else:
                    cursor.execute("INSERT INTO balance (currency, balance, avg_buy_price) VALUES ('BTC', ?, ?)", (btc_to_buy, current_price))

                # 매수 기록 추가
                cursor.execute('''
                    INSERT INTO decisions (timestamp, decision, percentage, reason, btc_balance, krw_balance, btc_avg_buy_price, btc_krw_price)
                    VALUES (?, 'BUY', ?, ?, ?, ?, ?, ?)
                ''', (datetime.now(), percentage, reason, new_btc_balance, new_krw_balance, btc_to_buy, current_price))

                conn.commit()
                print("Buy order successful:", btc_to_buy)
            else:
                print("Insufficient funds for buy order.")
    except Exception as e:
        print(f"Failed to execute buy order: {e}")
    finally:
        conn.close()

def execute_sell(percentage, reason="Auto trade"):
    print("Attempting to sell a percentage of BTC...")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT balance FROM balance WHERE currency = 'BTC'")
        btc_balance_data = cursor.fetchone()
        if btc_balance_data:
            btc_balance = btc_balance_data[0]
            amount_to_sell = btc_balance * (percentage / 100)

            current_price = pyupbit.get_orderbook(ticker="KRW-BTC")['orderbook_units'][0]["ask_price"]

            if current_price * amount_to_sell > 5000:
                krw_earned = amount_to_sell * current_price * 0.9995

                # 잔액 업데이트
                new_btc_balance = btc_balance - amount_to_sell
                cursor.execute("UPDATE balance SET balance = ? WHERE currency = 'BTC'", (new_btc_balance,))

                cursor.execute("SELECT balance FROM balance WHERE currency = 'KRW'")
                krw_balance_data = cursor.fetchone()
                if krw_balance_data:
                    new_krw_balance = krw_balance_data[0] + krw_earned
                    cursor.execute("UPDATE balance SET balance = ? WHERE currency = 'KRW'", (new_krw_balance,))
                else:
                    cursor.execute("INSERT INTO balance (currency, balance) VALUES ('KRW', ?)", (krw_earned,))

                # 매도 기록 추가
                cursor.execute('''
                    INSERT INTO decisions (timestamp, decision, percentage, reason, btc_balance, krw_balance, btc_avg_buy_price, btc_krw_price)
                    VALUES (?, 'SELL', ?, ?, ?, ?, ?, ?)
                ''', (datetime.now(), percentage, reason, new_btc_balance, new_krw_balance, amount_to_sell, current_price))

                conn.commit()
                print("Sell order successful:", amount_to_sell)
            else:
                print("Insufficient BTC for sell order.")
    except Exception as e:
        print(f"Failed to execute sell order: {e}")
    finally:
        conn.close()

def make_decision_and_execute():
    print("Making decision and executing...")
    try:
        # 데이터 수집
        news_data = get_news_data()
        data_json = fetch_and_prepare_data()
        last_decisions = fetch_last_decisions()
        fear_and_greed = fetch_fear_and_greed_index(limit=30)
        current_status = get_current_status()
        current_base64_image = get_current_base64_image()
    except Exception as e:
        # 데이터 수집에 실패했을 경우 에러 출력
        print(f"Error: {e}")
    else:
        max_retries = 5  # 최대 재시도 횟수
        retry_delay_seconds = 5  # 재시도 간격 (초)
        decision = None  # 결정 변수 초기화
        for attempt in range(max_retries):
            try:
                # GPT-4로 데이터를 분석하여 매수 또는 매도 결정 생성
                advice = analyze_data_with_gpt4(news_data, data_json, last_decisions, fear_and_greed, current_status, current_base64_image)
                decision = json.loads(advice)  # 결정 데이터를 JSON 형식으로 파싱
                break  # 결정이 성공적으로 생성되면 루프 종료
            except Exception as e:
                # 파싱 실패 시 재시도
                print(f"JSON parsing failed: {e}. Retrying in {retry_delay_seconds} seconds...")
                time.sleep(retry_delay_seconds)
                print(f"Attempt {attempt + 2} of {max_retries}")
        
        if not decision:
            # 최대 재시도 횟수를 초과해도 결정을 내리지 못한 경우
            print("Failed to make a decision after maximum retries.")
            return
        else:
            try:
                # 결정 실행
                # 결정 데이터에서 비율(percentage)을 가져오며, 기본값은 100%
                percentage = decision.get('percentage', 100)

                # 결정이 "buy"인 경우 매수 실행
                if decision.get('decision') == "buy":
                    execute_buy(percentage)
                # 결정이 "sell"인 경우 매도 실행
                elif decision.get('decision') == "sell":
                    execute_sell(percentage)
                
                # 결정 저장
                # 최종 결정 및 현재 상태를 데이터베이스에 저장
                save_decision_to_db(decision, current_status)
            except Exception as e:
                # 실행 또는 저장 중 오류가 발생한 경우
                print(f"Failed to execute the decision or save to DB: {e}")

if __name__ == "__main__":
    initialize_db()
    # testing
    # schedule.every().minute.do(make_decision_and_execute)


    while True:
        schedule.run_pending()
        time.sleep(1)