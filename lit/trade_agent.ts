import axios from "axios";

// Define the interfaces for input/output data
interface MarketData {
  price: number;
  sentiment: string;
  volatility: number;
}

interface TradeDetails {
  asset: string;
  amount: number;
  market_price: number;
  trade_price: number;
}

interface TradePredictionInput {
  user_persona: string[];
  user_history: { [key: string]: string }[];
}

interface TradePredictionOutput {
  agent_id: string;
  trade_details: TradeDetails;
  user_reasoning: string;
  market_data: MarketData;
}

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY"
const OPENAI_API_URL = "https://api.openai.com/v1/completions";

// Function to call OpenAI's API to generate trade suggestion
async function analyzeAndGenerateTrade(userInput: TradePredictionInput): Promise<TradePredictionOutput> {
  const prompt = `You are a trading expert. Analyze the following user's persona and past trading history, then generate a trade suggestion based on the analysis and current market data.

User Persona: ${JSON.stringify(userInput.user_persona)}

Past Trades: ${JSON.stringify(userInput.user_history)}

Instructions:
1. Infer the user's trading persona, including their risk tolerance, preferred trading style, and decision-making approach.
2. Identify the most traded token and protocol from the user's past trades.
3. Simulate fetching current market data for the most traded token, including price, sentiment, and volatility.
4. Generate trade details, including the asset, amount, market price, and trade price (slightly deviated from market price).
5. Provide reasoning for why the user would make this trade based on their persona, past trades, and market data.

Return the results in the following JSON FORMAT WITHOUT BACKTICKS IN A SINGLE LINE:
{
  "persona_analysis": "string",
  "most_traded_token": "string",
  "most_used_protocol": "string",
  "market_data": {
    "price": float,
    "sentiment": "string",
    "volatility": float
  },
  "trade_details": {
    "asset": "string",
    "amount": float,
    "market_price": float,
    "trade_price": float
  },
  "user_reasoning": "string"
}`;

  // Call OpenAI API
  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4",
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      }
    });

    const result = response.data.choices[0].text.trim();
    const tradeData: TradePredictionOutput = JSON.parse(result);

    return tradeData;
  } catch (error) {
    console.error("Error generating trade suggestion:", error);
    throw new Error("Failed to generate trade suggestion");
  }
}

// Example usage of the function
async function exampleUsage() {
  const userInput: TradePredictionInput = {
    user_persona: ["Risk-averse", "Long-term investor"],
    user_history: [
      {
        asset: "Bitcoin",
        amount: "2",
        trade_type: "buy"
      },
      {
        asset: "Ethereum",
        amount: "5",
        trade_type: "sell"
      }
    ]
  };

  try {
    const tradePrediction = await analyzeAndGenerateTrade(userInput);
    console.log("Trade Prediction Output:", tradePrediction);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example usage
exampleUsage();
