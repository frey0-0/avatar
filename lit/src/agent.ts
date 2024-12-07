import { getYellowstoneChainMetrics } from "./utils/utils";
import { humanVerification, signAndBroadcastTransaction } from "./helper";
import threshold from "./utils/thresholdCalc";
import { time } from "console";
const timeInt = 1*60*1000;
export async function autonomousAgent(amt_threshold: number) {
	try {
		const metrics = await getYellowstoneChainMetrics();
		const response = await fetch("/lit", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ metrics, amt_threshold }),
		});
		const data = await response.json();

		if (!data.success) {
			throw new Error("Failed to get AI decision");
		}

		const { decision } = data;

		if (decision.shouldTransact) {
			if (decision.requiresVerification) {
				console.log("Amount exceeds threshold - requesting human verification");
				console.log(decision.reasoning);
				await humanVerification(parseFloat(decision.amount));
				return decision;
			}

			console.log(
				"AI Agent initiating direct transaction:",
				decision.reasoning
			);
			const txHash = await signAndBroadcastTransaction(
				false,
				undefined,
				decision.amount
			);
			console.log("Transaction completed with hash:", txHash);
			return decision;
		}
	} catch (error) {
		console.error("AI agent error:", error);
		throw error;
	}
}

export async function startAutonomousAgent() {
	const amt_threshold = threshold;
	setInterval(async () => {
		try {
			if (amt_threshold == null) {
				console.error("Threshold not set");
				return;
			}
			await autonomousAgent(amt_threshold);
		} catch (error) {
			console.error("Autonomous cycle error:", error);
		}
	}, timeInt);
}
