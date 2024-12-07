// @ts-nocheck
import { PrismaClient } from "@prisma/client";

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

		const prompt = `Given the current Yellowstone network conditions:
        - Gas Price: ${metrics.gasPrice} gwei
        - Network Load: ${metrics.networkLoad}
        - Transactions in last block: ${metrics.transactionCount}
        
        Generate a suitable gwei amount to send in a transaction. The amount should be between 1 and 40 gwei.
        Consider the following:
        - If network load is High, suggest lower amounts
        - If gas price is high (>50 gwei), suggest lower amounts
        - If conditions are favorable (low load, low gas), you can suggest higher amounts
        
        Return in JSON format: { "amount": number, "reasoning": "string" }`;

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

		if (!decision.amount || !decision.reasoning) {
			throw new Error("Invalid decision format from OpenAI");
		}

		const baseAmount = parseFloat(decision.amount);
		if (isNaN(baseAmount)) {
			throw new Error("Invalid amount value from OpenAI");
		}

		let reasoning = decision.reasoning;
		let requiresVerification = false;
		let urgency = "medium";
		const shouldTransact = true;

		if (baseAmount > parseFloat(amount_threshold)) {
			requiresVerification = true;
			reasoning +=
				"\n⚠️ Amount exceeds threshold - requires human verification.";
		}

		if (metrics.networkLoad === "High") {
			reasoning += "\n⚠️ High network congestion but proceeding.";
		} else if (metrics.networkLoad === "Low") {
			urgency = "high";
			reasoning += "\n✅ Network congestion low.";
		}

		if (metrics.gasPrice > 50) {
			reasoning += "\n Gas prices are high.";
			urgency = "low";
		} else if (metrics.gasPrice < 20) {
			urgency = "high";
			reasoning += "\n✅ Gas prices are favorable.";
		}

		reasoning += `\nCurrent conditions:
            - Gas Price: ${metrics.gasPrice} gwei
            - Network Load: ${metrics.networkLoad}
            - Transactions in last block: ${metrics.transactionCount}
            - Amount to send: ${baseAmount} gwei
            - Requires Verification: ${requiresVerification}`;

		const response = {
			shouldTransact,
			amount: baseAmount.toString(),
			reasoning,
			urgency,
			requiresVerification,
			metrics,
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
