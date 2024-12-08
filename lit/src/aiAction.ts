// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import axios from "axios";

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

const _aiActionCode = async () => {
	try {
		const prisma = new PrismaClient();
		let amount_threshold;

		const now = new Date();
		const oneDayAgo = new Date();
		oneDayAgo.setDate(now.getDate() - 1);
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(now.getDate() - 7);

		const lastDayTransactions = await prisma.transaction.findMany({
			where: {
				timestamp: {
					gte: oneDayAgo,
				},
			},
		});

		const lastWeekTransactions = await prisma.transaction.findMany({
			where: {
				timestamp: {
					gte: sevenDaysAgo,
				},
			},
		});

		let marketCrash = false;
		let overallRating = 3;
		let lossRatio = 0;
		let volatility = 0;

		if (lastDayTransactions.length > 0) {
			const exitPrices = lastDayTransactions.map((tx) => tx.exitPrice);
			const maxExitPrice = Math.max(...exitPrices);
			const minExitPrice = Math.min(...exitPrices);
			const oneDayVolatility = (maxExitPrice - minExitPrice) / maxExitPrice;
			if (oneDayVolatility > 0.3) {
				marketCrash = true;
			}
		}

		if (lastWeekTransactions.length > 0) {
			const losingTrades = lastWeekTransactions.filter(
				(tx) => tx.exitPrice < tx.enterPrice
			).length;
			lossRatio = losingTrades / lastWeekTransactions.length;

			if (lossRatio > 0.8) {
				marketCrash = true;
			}

			const exitPrices = lastWeekTransactions.map((tx) => tx.exitPrice);
			if (exitPrices.length > 1) {
				const maxExitPrice = Math.max(...exitPrices);
				const minExitPrice = Math.min(...exitPrices);
				volatility = (maxExitPrice - minExitPrice) / maxExitPrice;

				if (volatility > 0.5) {
					marketCrash = true;
				}
			}
		}

		if (marketCrash) {
			console.warn("❌ Market crash detected. No trades will be performed.");
			Lit.Actions.setResponse({
				response: {
					shouldTransact: false,
					reason:
						"Market crash or extreme conditions detected. Trading halted for safety.",
				},
			});
			return;
		}

		overallRating = 3;
		amount_threshold = 1 + (overallRating - 3) / 10;
		if (lossRatio > 0.5) amount_threshold *= 1 - lossRatio;

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

		const openAIResponse = await LitActions.runOnce(
			{ waitForResponse: true, name: "AI_Decision" },
			async () => {
				try {
					const response = await fetch(
						"https://api.openai.com/v1/chat/completions",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${apiKey}`,
							},
							body: JSON.stringify({
								model: "gpt-4o-mini",
								messages: [{ role: "user", content: prompt }],
							}),
						}
					);

					if (!response.ok) {
						throw new Error(`OpenAI API error: ${response.statusText}`);
					}

					const data = await response.json();

					if (!data.choices?.[0]?.message?.content) {
						throw new Error("Invalid response format from OpenAI");
					}

					return data.choices[0].message.content;
				} catch (error) {
					console.error("OpenAI API Error:", error);
					throw new Error(`OpenAI API Error: ${error.message}`);
				}
			}
		);

		if (!openAIResponse) {
			throw new Error("No response received from OpenAI");
		}

		let decision;
		try {
			decision = JSON.parse(openAIResponse);
		} catch (error) {
			console.error("JSON Parse Error:", openAIResponse);
			throw new Error(`Failed to parse OpenAI response: ${error.message}`);
		}

		// Validate the structure and contents of the OpenAI response
		if (
			!decision.trade_details ||
			!decision.market_data ||
			!decision.user_reasoning
		) {
			throw new Error(
				"Invalid decision format from OpenAI. Missing required fields."
			);
		}

		const { trade_details, market_data, user_reasoning } = decision;

		const baseAmount = parseFloat(trade_details.amount);
		if (isNaN(baseAmount)) {
			throw new Error("Invalid amount value in trade details from OpenAI");
		}

		if (
			typeof market_data.price !== "number" ||
			typeof market_data.volatility !== "number" ||
			typeof market_data.sentiment !== "string"
		) {
			throw new Error("Invalid market data format from OpenAI");
		}

		let reasoning = user_reasoning;
		let requiresVerification = false;
		let urgency = "medium";
		let shouldTransact = true;

		if (baseAmount > parseFloat(amount_threshold)) {
			requiresVerification = true;
			reasoning +=
				"\n⚠️ Amount exceeds threshold - requires human verification.";
		}

		if (metrics.networkLoad === "High") {
			reasoning +=
				"\n⚠️ High network congestion - potential delays but proceeding.";
		} else if (metrics.networkLoad === "Low") {
			urgency = "high";
			reasoning +=
				"\n✅ Network congestion is low - favorable for transactions.";
		}

		if (metrics.gasPrice > 50) {
			reasoning += "\n⚠️ Gas prices are high - consider delaying transactions.";
			urgency = "low";
		} else if (metrics.gasPrice < 20) {
			urgency = "high";
			reasoning +=
				"\n✅ Gas prices are favorable - optimal time for transactions.";
		}

		reasoning += `\n### Current Trading Conditions:
- Gas Price: ${metrics.gasPrice} gwei
- Network Load: ${metrics.networkLoad}
- Transactions in Last Block: ${metrics.transactionCount}
- Proposed Trade Amount: ${baseAmount} gwei
- Requires Verification: ${requiresVerification ? "Yes" : "No"}`;

		const response = {
			shouldTransact,
			amount: baseAmount.toFixed(2), 
			reasoning,
			urgency,
			requiresVerification,
			metrics: {
				gasPrice: metrics.gasPrice,
				networkLoad: metrics.networkLoad,
				transactionCount: metrics.transactionCount,
			},
			trade_details,
			market_data,
		};

		Lit.Actions.setResponse({ response: JSON.stringify(response) });
	} catch (error) {
		console.error("❌ Error in Lit Action:", error);
		Lit.Actions.setResponse({
			response: {
				shouldTransact: false,
				error: error.message,
				details: error.stack,
			},
		});
	}
};

export const aiActionCode = `(${_aiActionCode.toString()})();`;
