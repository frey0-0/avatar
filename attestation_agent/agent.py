from langchain_openai import ChatOpenAI
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from cdp import Wallet
from cdp_langchain.tools import CdpTool
from pydantic import BaseModel, Field
from typing import Tuple
from flask_cors import CORS

from concurrent.futures import ThreadPoolExecutor

import flask
import json
import uuid

app = flask.Flask(__name__)

CORS(app, resources={r"/attest": {"origins": "http://localhost:3001"}})

class TradeInput(BaseModel):
    trade_details: dict = Field(
        ..., description="Details of the trade, including asset, amount, price, etc."
    )
    user_reasoning: str = Field(
        ..., description="The user's reasoning behind the trade."
    )
    market_data: dict = Field(
        ..., description="Current market data for the asset being traded."
    )


class AttestInput(BaseModel):
    agent_id: str = Field(..., description="Agent ID")
    reputation: int = Field(..., description="Reputation Score")
    outlier: bool = Field(..., description="Whether the trade is an outlier")


anomaly_thresholds = {
    "trade_amount": 100000,
    "price_deviation": 0.2,
    "trade_frequency": 10,
    "volatility_threshold": 0.5,
}

llm = ChatOpenAI(model="gpt-4o-mini")

cdp = CdpAgentkitWrapper()

# Create toolkit from wrapper
cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)

# Get all available tools
# tools = cdp_toolkit.get_tools()
tools = []


def set_anomaly_thresholds(trade_details: dict, user_history: dict, market_data: dict):
    """
    Use the LLM to dynamically set anomaly detection thresholds based on the trade context.
    """
    # Prepare the input for the LLM
    prompt = f"""  
    You are a crypto trading expert. Based on the following details, set thresholds for detecting anomalies in trades:  

    - Trade Details: {trade_details}  
    - User History: {user_history}  
    - Market Data: {market_data}  

    Provide the thresholds as a JSON object with the following keys:  
    - "trade_amount": Maximum trade amount before it is considered an anomaly.  
    - "price_deviation": Maximum allowed price deviation (as a fraction, e.g., 0.2 for 20%) from the market price.  
    - "trade_frequency": Maximum number of trades allowed in a day before it is considered an anomaly.  
    - "volatility_threshold": Maximum asset volatility (as a fraction, e.g., 0.5 for 50%) before it is considered an anomaly.  

    Respond with only the JSON object. Just return a JSON in a single line without backticks.  
    """

    # Use the LLM to get the thresholds
    response = llm.invoke(
        "You are a helpful assistant. You are a crypto trading expert\n" + prompt
    )
    try:
        # Parse the response as a dictionary
        thresholds = eval(response.content)
        anomaly_thresholds.update(thresholds)
    except Exception as e:
        print(f"Error parsing thresholds from LLM: {e}")
        # If parsing fails, keep the default thresholds


def calculate_reputation_score(
    user_reasoning: str,
    trade_details: dict,
    user_history: dict,
    market_data: dict,
) -> int:
    """
    Use an LLM to calculate a reputation score for the trade based on the user's reasoning and trade details.
    """
    # Prepare the input for the LLM
    prompt = f"""  
    You are a crypto trading expert. A user has made a trade, and you need to evaluate their reputation score (0-100) based on the following details. GIVE EMPHASIS TO THE TRADE DETAILS:  

    - Trade Details: {trade_details} 
    - User Reasoning: {user_reasoning}  
    - User History: {user_history}  
    - Market Data: {market_data}  

    Consider the following:  
    - Is the trade logical based on the user's reasoning and market conditions?  
    - Does the trade align with the user's historical trading patterns?  
    - Is the trade risky based on market volatility or price deviation?  
    - Provide a reputation score between 0 and 100, where 100 is excellent and 0 is very poor.  

    Respond with only the reputation score as a number. Use the internet to get realtime information about the market.
    """

    # Use the LLM to get the reputation score
    response = llm.invoke(
        "You are a helpful assistant. You are a crypto trading expert\n" + prompt
    )
    try:
        # breakpoint()
        # Parse the response as an integer
        reputation_score = int(response.content)
    except ValueError:
        # If parsing fails, return a default score
        reputation_score = 50

    # Ensure score is within 0-100 range
    reputation_score = max(0, min(100, reputation_score))
    return reputation_score


def attest_trade(agent_id: str, reputation: int, outlier: bool):
    """
    Function to attest the trade
    """
    import requests
    import json

    url = "http://localhost:9000/attest"

    headers = {"Content-Type": "application/json"}

    payload = {"agent_id": agent_id, "reputation": reputation, "outlier": outlier}

    # Sending the POST request using requests library

    response = requests.post(url, json=payload, headers=headers)

    # Checking the response status
    if response.status_code == 200:
        print("Response:", response.json())
    else:
        print(
            f"Failed to attest trade. Status code: {response.status_code}, Response: {response.text}"
        )


def analyse_trade(trade_details: dict, user_history: dict, market_data: dict):
    """
    Function to analyse the trade
    """
    # Dynamically set thresholds using the LLM
    set_anomaly_thresholds(trade_details, user_history, market_data)

    # Extract trade details
    trade_amount = trade_details.get("amount", 0)
    market_price = trade_details.get("market_price", 0)
    trade_price = trade_details.get("trade_price", 0)
    asset_volatility = market_data.get("volatility", 0)
    # trade_frequency = user_history.get("trade_frequency", 0)

    # Check if trade amount exceeds threshold
    if trade_amount > anomaly_thresholds["trade_amount"]:
        return True

    # Check if trade price deviates significantly from market price
    if market_price > 0:
        price_deviation = abs(trade_price - market_price) / market_price
        if price_deviation > anomaly_thresholds["price_deviation"]:
            return True

    # Check if asset volatility exceeds threshold
    if asset_volatility > anomaly_thresholds["volatility_threshold"]:
        return True
    return False


def process_trade(temperature: float, agent_id: str) -> Tuple[str, int, bool]:
    """
    Process the trade and return whether it is an anomaly and the reputation score.
    """
    llm.temperature = temperature
    # read the input.txt file from the same directory
    with open("input.txt", "r") as file:
        data = file.read()

    # convert this to a dictionary
    data = json.loads(data)
    data = data["data"]
    # breakpoint()
    # trade_input = TradeInput.model_validate_json(data)
    trade_details = data["trade_details"]
    user_reasoning = data["user_reasoning"]
    market_data = data["market_data"]
    import requests

    user_history = requests.get(
        "http://localhost:6000/fetch_closest_trades?symbol=ETH"
    ).json()

    # Analyze the trade for anomalies
    is_anomaly = analyse_trade(trade_details, user_history, market_data)
    print("is_anomaly", is_anomaly)

    # Calculate the reputation score using the LLM

    reputation_score = calculate_reputation_score(
        user_reasoning, trade_details, user_history, market_data
    )

    response = attest_trade(agent_id, reputation_score, is_anomaly)
    print("attest_trade", response)

    return agent_id, reputation_score, is_anomaly


process_trade_tool = CdpTool(
    name="process_trade",
    description="This tool is used to analyse the trade details and provide a reputation score.",
    cdp_agentkit_wrapper=cdp,
    args_schema=TradeInput,
    func=process_trade,
)

# Create the agenturrent portfolio along with a trade they are considering making. You will analyse the information and attest the trade, provid
agent_executor = create_react_agent(
    llm,
    tools=tools,
    state_modifier="""You are a trading expert agent with knowledge of cryptocurrency trades. 
    - When given a trade input, you first analyze the trade using the `process_trade` tool.
    - After processing the trade, automatically use the output to call the `attest_trade` tool.
    - Ensure the sequence is: process first, attest second.""",
)


# Function to interact with the agent
def ask_agent(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "my_first_agent"}},
    ):
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)


@app.route("/attest", methods=["POST"])
def attest():
    data = flask.request.json

    with open("input.txt", "w") as file:
        file.write(json.dumps(data))

    # response = ask_agent("Process the trade")
    temps = [0.2, 0.4, 0.6, 0.8, 1.0]
    sum_score = 0
    # for temp in temps:
    #     agent_id = "agent-" + str(uuid.uuid4())
    #     _, score, _ = process_trade(temp, agent_id)
    #     sum_score += score
    # average_score = sum_score / 5

    _, score, _ = process_trade(1, "agent-" + str(uuid.uuid4()))
    average_score = sum_score
    outlier = True
    if average_score > 50:
        outlier = False
    res = {"average_score": average_score, "outlier": outlier}
    return res


if __name__ == "__main__":
    app.run(port=8000)
