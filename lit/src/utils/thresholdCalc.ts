import { tavily } from "@tavily/core";
import OpenAI from "openai";

interface TavilySearchResponse {
	results: { content: string }[];
}

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
	apiKey: apiKey,
});

async function getTavilyPrediction(
	prompt: string
): Promise<TavilySearchResponse | null> {
	try {
		const response = await tvly.search(prompt, {});
		return response;
	} catch (error) {
		console.error("Error executing Tavily search:", error);
		return null;
	}
}

async function getAveragePrices(
	symbol: string,
	interval: string,
	days: number
): Promise<number[]> {
	const endTime = Date.now();
	const startTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).getTime();

	const url = "https://api.binance.com/api/v3/klines";
	const params = new URLSearchParams({
		symbol: symbol,
		interval: interval,
		startTime: startTime.toString(),
		endTime: endTime.toString(),
		limit: "1000",
	});

	try {
		const response = await fetch(`${url}?${params.toString()}`);
		const data = await response.json();
		const averagePrices: number[] = [];
		data.forEach((kline: any) => {
			const openPrice = parseFloat(kline[1]);
			const highPrice = parseFloat(kline[2]);
			const lowPrice = parseFloat(kline[3]);
			const closePrice = parseFloat(kline[4]);
			const averagePrice = (openPrice + highPrice + lowPrice + closePrice) / 4;
			averagePrices.push(averagePrice);
		});

		return averagePrices;
	} catch (error) {
		console.error("Error fetching Binance prices:", error);
		return [];
	}
}

async function getOpenAIPrediction(
	tavilyPrediction: TavilySearchResponse,
	averagePrices: number[],
	userAnswers: string[]
): Promise<number | null> {
	const prompt = `
  Based on the following data, predict the Ethereum price for today:

  Tavily Prediction: ${tavilyPrediction.results
		.map((result) => result.content)
		.join("\n")}

  Last 7 days average prices per hour:
  ${averagePrices
		.map((price, index) => `Day ${index + 1}: ${price.toFixed(2)}`)
		.join("\n")}

  Additionally, consider the user's trading preferences:

  1. *Primary goal for the bot*: ${userAnswers[0]} 
  2. *Portfolio allocation for trading*: ${userAnswers[1]}% 
  3. *Maximum loss tolerated on a single swap*: ${userAnswers[2]} 
  4. *Minimum profit expected per swap*: ${userAnswers[3]} 
  5. *Trade execution frequency*: ${userAnswers[4]} 
  6. *Preference for swapping into stablecoins during volatility*: ${
		userAnswers[5]
	} 
  7. *Cryptocurrencies or pairs to prioritize/avoid*: ${userAnswers[6]} 
  8. *Focus on market behavior*: ${userAnswers[7]} 
  9. *Prioritize*: ${
		userAnswers[8]
	} (Maximizing profits, minimizing risk, or balancing both?)
  10. *Tolerance for temporary performance dips*: ${userAnswers[9]} 

  Considering the above preferences, predict the max price of a single swap that a trading bot, mocking the user's behavior on chain, would execute today in dollars.
  GIVE HIGH WEIGHTAGE TO THE USER'S PREFERENCES, GIVE THE TRADE VALUE IN RANGE OF 0-1000 USD.

  *JUST OUTPUT ONE FLOATING POINT NUMBER AS THE PREDICTION.*
`;

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant with knowledge of web3 and cryptocurrencies",
				},
				{ role: "user", content: prompt },
			],
		});

		const choice = completion.choices && completion.choices[0];
		if (!choice || !choice.message || !choice.message.content) {
			console.error("Invalid response from OpenAI API:", completion);
			return null;
		}

		const prediction = choice.message.content.trim();
		return parseFloat(prediction);
	} catch (error) {
		console.error("Error fetching prediction from OpenAI:", error);
		return null;
	}
}

async function getEthereumPrediction() {
	const prompt =
		"Give me latest news about Ethereum price increasing or decreasing";

	try {
		const [tavilyPrediction, averagePrices] = await Promise.all([
			getTavilyPrediction(prompt),
			getAveragePrices("ETHUSDT", "1h", 7),
		]);

		let prediction = "";
		if (tavilyPrediction) {
			for (let i = 0; i < tavilyPrediction.results.length; i++) {
				prediction = prediction + tavilyPrediction.results[i].content + "\n";
			}
		}

		if (!tavilyPrediction || averagePrices.length === 0) {
			return 0;
		}

		const userAnswers = [
			"Low risk trading with very low risk",
			"50",
			"10%",
			"5%",
			"Thrice every hour",
			"Yes",
			"Prioritize: ETH, Avoid: DOGE",
			"Bullish",
			"Balancing both",
			"10%",
		];

		const openAIPrediction = await getOpenAIPrediction(
			tavilyPrediction,
			averagePrices,
			userAnswers
		);

		return openAIPrediction;
	} catch (error) {
		console.error("Error fetching combined data:", error);
		return 0;
	}
}

let threshold: number | null = null;

getEthereumPrediction()
	.then((result) => {
		threshold = result ?? 0;
	})
	.catch((error) => {
		console.error("Error fetching Ethereum prediction:", error);
		threshold = 0; 
	});

export default threshold;
