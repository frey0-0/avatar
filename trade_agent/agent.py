from langchain_openai import ChatOpenAI
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langgraph.prebuilt import create_react_agent
from langchain_core.messages import HumanMessage
from cdp_langchain.tools import CdpTool
from pydantic import BaseModel, Field
from typing import Tuple, List, Dict, Any
from flask_cors import CORS

import flask
import json

app = flask.Flask(__name__)
CORS(app, resources={r"/trade": {"origins": "http://localhost:3000"}})

llm = ChatOpenAI(model="gpt-4o-mini")


class TradePredictionOutput(BaseModel):
    agent_id: str = Field(..., description="Agent ID")
    trade_details: dict = Field(
        ..., description="Details of the trade, including asset, amount, price, etc."
    )
    user_reasoning: str = Field(
        ..., description="The user's reasoning behind the trade."
    )
    # user_history: dict = Field(..., description="Historical trading data of the user, including past trades and patterns.")
    market_data: dict = Field(
        ..., description="Current market data for the asset being traded."
    )


class TradePredictionInput(BaseModel):
    user_persona: List[str] = Field(
        ..., description="User's persona, including risk tolerance, trading style, etc."
    )
    user_history: List[Dict[Any, Any]] = Field(
        ..., description="User's past trading history, including trades and patterns."
    )


def analyze_and_generate_trade() -> TradePredictionOutput:
    """
    Use a single LLM prompt to analyze the user's persona, past trades, and fetch market data,
    then generate a trade based on the combined analysis.
    """
    import json

    with open("input.txt", "r") as f:
        data = json.loads(f.read())
    data["user_persona"] = json.loads(data["user_persona"])
    # data = TradePredictionInput.model_validate_json(data)
    user_persona = data["user_persona"]
    user_history = data["user_history"]
    price_feed = data["price_feed"]
    prompt = f"""  
        You are a trading expert. Analyze the following user's persona and past trading history,   
        then generate a trade suggestion based on the analysis and current market data. Use WEB SEARCH to fetch the current market trending and data to make a better trade suggestion.
  
        User Persona:  
        {user_persona}  
  
        Past Trades:  
        {user_history} 

        Current Price Feed:
        {price_feed}
  
        Instructions:  
        1. Infer the user's trading persona, including their risk tolerance, preferred trading style, and decision-making approach.  
        2. Identify the most traded token and protocol from the user's past trades.  
        3. Simulate fetching current market data for the most traded token, including price, sentiment, and volatility.  
        4. Generate trade details, including the asset, amount, market price, and trade price (slightly deviated from market price).  
        5. Provide reasoning for why the user would make this trade based on their persona, past trades, and market data.  

        THE PERSONA OF THE USER SHOULD BE THE UTMOST IMPORTANT FACTOR IN DETERMINING THE TRADE SUGGESTION. DO NOT GIVE VERY HIGH TRADES LIKE GREATER THAN 1500 USD.
        Return the results in the following JSON FORMAT WITHOUT BACKTICKS IN A SINGLE LINE:  
        {{  
            "persona_analysis": "string",  
            "most_traded_token": "string",  
            "most_used_protocol": "string",  
            "market_data": {{  
                "price": float,  
                "sentiment": "string",  
                "volatility": float  
            }},  
            "trade_details": {{  
                "asset": "string",  
                "amount": float,  
                "market_price": float,  
                "trade_price": float  
            }},  
            "user_reasoning": "string"  
        }}  
        """
    # Get the response from the LLM
    response = llm.invoke(prompt)
    result = response.content
    # Parse the response (assuming the LLM returns a valid JSON string)
    import json

    trade_data = json.loads(result)

    # Create the TradeInput object
    trade_input = TradePredictionOutput(
        agent_id="emulated_agent_1",
        trade_details=trade_data["trade_details"],
        user_reasoning=trade_data["user_reasoning"],
        market_data=trade_data["market_data"],
    )
    with open("output.txt", "w") as f:
        f.write(
            json.dumps(
                {
                    "trade_details": trade_input.trade_details,
                    "user_reasoning": trade_input.user_reasoning,
                    "market_data": trade_input.market_data,
                    "agent_id": trade_input.agent_id,
                }
            )
        )


cdp = CdpAgentkitWrapper()

generate_trade_tool = CdpTool(
    name="generate_trade",
    description="Generate a trade suggestion based on user persona and past trading history.",
    cdp_agentkit_wrapper=cdp,
    args_schema=TradePredictionInput,
    func=analyze_and_generate_trade,
    return_schema=TradePredictionOutput,
)
tools = [generate_trade_tool]

agent_executor = create_react_agent(
    llm,
    tools=tools,
    state_modifier="""You are a trading expert. Analyze the following user's persona and past trading history, then generate a trade suggestion based on the analysis and current market data.""",
)


def ask_agent(question: str):
    for chunk in agent_executor.stream(
        {"messages": [HumanMessage(content=question)]},
        {"configurable": {"thread_id": "my_first_agent"}},
    ):
        if "agent" in chunk:
            print(chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print(chunk["tools"]["messages"][0].content)


import requests


@app.route("/trade", methods=["POST"])
def trade():
    data = {}
    data["user_persona"] = flask.request.json["body"]["answers"]
    data["price_feed"] = flask.request.json["body"]["price_feed"]
    data["user_history"] = requests.get(
        "http://localhost:6000/fetch_closest_trades?symbol=ETH"
    ).json()
    with open("input.txt", "w") as f:
        f.write(json.dumps(data))

    # response = ask_agent("Suggest a trade for the user")
    analyze_and_generate_trade()
    with open("output.txt", "r") as f:
        data = f.read()

    res = json.loads(data)
    return res


if __name__ == "__main__":
    app.run(port=5000)
