import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({ apiKey: 'your-openai-api-key' });

interface TradeDetails {
  amount: number;
  market_price: number;
  trade_price: number;
}

interface UserHistory {
  trade_frequency: number;
}

interface MarketData {
  volatility: number;
}

interface AnomalyThresholds {
  trade_amount: number;
  price_deviation: number;
  trade_frequency: number;
  volatility_threshold: number;
}

const anomalyThresholds: AnomalyThresholds = {
  trade_amount: 100000,
  price_deviation: 0.2,
  trade_frequency: 10,
  volatility_threshold: 0.5,
};

interface UserReasoning {
  reason: string;
}

interface TradeInput {
  trade_details: TradeDetails;
  user_reasoning: UserReasoning;
  user_history: UserHistory;
  market_data: MarketData;
  agent_id: string;
}
interface TradeOutput {
  agent_id: string;
  reputation_score: number;
  is_anomaly: boolean;
}



async function processTrade(tradeInput: TradeInput): Promise<TradeOutput> {
  async function calculateReputationScore(
    userReasoning: string,
    tradeDetails: object,
    userHistory: object,
    marketData: object
  ): Promise<number> {
    const prompt = `  
      You are a crypto trading expert. A user has made a trade, and you need to evaluate their reputation score (0-100) based on the following details. GIVE EMPHASIS TO THE TRADE DETAILS:
  
      - Trade Details: ${JSON.stringify(tradeDetails)} 
      - User Reasoning: ${userReasoning}  
      - User History: ${JSON.stringify(userHistory)}  
      - Market Data: ${JSON.stringify(marketData)}  
  
      Consider the following:  
      - Is the trade logical based on the user's reasoning and market conditions?  
      - Does the trade align with the user's historical trading patterns?  
      - Is the trade risky based on market volatility or price deviation?  
      - Provide a reputation score between 0 and 100, where 100 is excellent and 0 is very poor.  
  
      Respond with only the reputation score as a number. Use the internet to get realtime information about the market.
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'system', content: 'You are a helpful assistant. You are a crypto trading expert.' }, { role: 'user', content: prompt }],
      });

      const choice = completion.choices && completion.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        console.error("Invalid response from OpenAI API:", completion);
        return 0;
      }
      const reputationScore = parseInt(choice.message.content.trim());
      return Math.max(0, Math.min(100, reputationScore));
    } catch (error) {
      console.error('Error calculating reputation score:', error);
      return 50;
    }
  }
  
  async function setAnomalyThresholds(
    tradeDetails: object,
    userHistory: object,
    marketData: object
  ): Promise<void> {
    const prompt = `  
      You are a crypto trading expert. Based on the following details, set thresholds for detecting anomalies in trades:  
  
      - Trade Details: ${JSON.stringify(tradeDetails)}  
      - User History: ${JSON.stringify(userHistory)}  
      - Market Data: ${JSON.stringify(marketData)}  
  
      Provide the thresholds as a JSON object with the following keys:  
      - "trade_amount": Maximum trade amount before it is considered an anomaly.  
      - "price_deviation": Maximum allowed price deviation (as a fraction, e.g., 0.2 for 20%) from the market price.  
      - "trade_frequency": Maximum number of trades allowed in a day before it is considered an anomaly.  
      - "volatility_threshold": Maximum asset volatility (as a fraction, e.g., 0.5 for 50%) before it is considered an anomaly.  
  
      Respond with only the JSON object. Just return a JSON in a single line without backticks.  
    `;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. You are a crypto trading expert.' },
          { role: 'user', content: prompt },
        ],
      });
      const choice = completion.choices && completion.choices[0];
      if (!choice || !choice.message || !choice.message.content) {
        console.error("Invalid response from OpenAI API:", completion);
        return
      }

      const thresholds = JSON.parse(choice.message.content.trim());
      Object.assign(anomalyThresholds, thresholds);
    } catch (error) {
      console.error('Error setting anomaly thresholds:', error);
      // If parsing fails, keep the default thresholds
    }
  }
  async function attestTrade(agentId: string, reputation: number, outlier: boolean): Promise<void> {
    const url = 'http://localhost:3000/attest';

    const headers = {
      'Content-Type': 'application/json',
    };

    const payload = {
      agent_id: agentId,
      reputation: reputation,
      outlier: outlier,
    };

    try {
      const response = await axios.post(url, payload, { headers });
      if (response.status === 200) {
        console.log('Response:', response.data);
      } else {
        console.log(`Failed to attest trade. Status code: ${response.status}, Response: ${response.data}`);
      }
    } catch (error) {
      console.error(`Failed to attest trade. Error: ${error}`);
    }
  }



  function analyseTrade(
    tradeDetails: TradeDetails,
    userHistory: UserHistory,
    marketData: MarketData
  ): boolean {
    // Dynamically set thresholds using the LLM (or other logic)
    setAnomalyThresholds(tradeDetails, userHistory, marketData);

    // Extract trade details
    const tradeAmount = tradeDetails.amount;
    const marketPrice = tradeDetails.market_price;
    const tradePrice = tradeDetails.trade_price;
    const assetVolatility = marketData.volatility;
    const tradeFrequency = userHistory.trade_frequency;

    // Check if trade amount exceeds threshold
    if (tradeAmount > anomalyThresholds.trade_amount) {
      return true;
    }

    // Check if trade price deviates significantly from market price
    if (marketPrice > 0) {
      const priceDeviation = Math.abs(tradePrice - marketPrice) / marketPrice;
      if (priceDeviation > anomalyThresholds.price_deviation) {
        return true;
      }
    }

    // Check if trade frequency exceeds threshold
    if (tradeFrequency > anomalyThresholds.trade_frequency) {
      return true;
    }

    // Check if asset volatility exceeds threshold
    if (assetVolatility > anomalyThresholds.volatility_threshold) {
      return true;
    }

    return false;
  }
  const { trade_details, user_reasoning, user_history, market_data, agent_id } = tradeInput;

  // Analyze the trade for anomalies
  const isAnomaly = analyseTrade(trade_details, user_history, market_data);
  console.log("is_anomaly", isAnomaly);

  // Calculate the reputation score using the LLM
  const reputationScore = await calculateReputationScore(
    user_reasoning.reason,
    trade_details,
    user_history,
    market_data
  );

  // Attest the trade (assuming the trade is valid)
  const response = attestTrade(agent_id, reputationScore, isAnomaly);
  console.log("attest_trade", response);

  // Write the results to output.txt
  const output: TradeOutput = {
    agent_id: agent_id,
    reputation_score: reputationScore,
    is_anomaly: isAnomaly,
  };
  return output;
}