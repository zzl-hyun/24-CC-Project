from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('trading_decisions.sqlite')
    conn.row_factory = sqlite3.Row
    return conn

# /decisions 엔드포인트: decisions 테이블에서 데이터를 가져옴
@app.route('/decisions', methods=['GET'])
def get_decisions():
    conn = get_db_connection()
    decisions = conn.execute('SELECT * FROM decisions').fetchall()
    conn.close()
    return jsonify([dict(row) for row in decisions])

# /balance 엔드포인트: balance 테이블에서 데이터를 가져옴
@app.route('/balance', methods=['GET'])
def get_balance():
    conn = get_db_connection()
    balance_data = conn.execute('SELECT * FROM balance').fetchall()
    conn.close()
    return jsonify([dict(row) for row in balance_data])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
