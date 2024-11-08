
import os
import pyupbit
from dotenv import load_dotenv
load_dotenv()
from openai import AzureOpenAI



  
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
    api_version="2024-08-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

response = client.chat.completions.create(
    model="gpt-4", # model = "deployment_name".
    messages=[
        {"role": "system", "content": "Provide some context and/or instructions to the model"},
        {"role": "user", "content": "hello"}
    ]
)
print(response.choices[0].message.content)


# upbit = pyupbit.Upbit(os.getenv("UPBIT_ACCESS_KEY"), os.getenv("UPBIT_SECRET_KEY"))
# price = pyupbit.get_current_price("KRW-BTC")
# print(price)