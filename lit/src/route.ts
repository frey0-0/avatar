import { NextResponse } from "next/server";
import { getPkpSessionSigs } from "./utils/utils";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK } from "@lit-protocol/constants";
import { aiActionCode } from "./aiAction";

const LIT_PKP_PUBLIC_KEY = process.env.PKP_PUBLIC_KEY;

export async function POST(request: Request) {
	try {
		const { metrics, amt_threshold } = await request.json();
		const decision = await makeSwapDecision(metrics, amt_threshold);

		console.log("🔄 Decision:", decision);

		return NextResponse.json({
			success: true,
			decision: decision,
		});
	} catch (error) {
		console.error("AI decision failed:", error);
		return NextResponse.json({
			success: false,
			error: "Failed to make AI decision",
		});
	}
}

async function makeSwapDecision(metrics: any, amt_threshold: number) {
	console.log("🔄 Connecting to Lit network...");
	const litNodeClient = new LitNodeClient({
		litNetwork: LIT_NETWORK.DatilDev,
		debug: false,
	});
	await litNodeClient.connect();
	console.log("✅ Connected to Lit network");

	const sessionSigs = await getPkpSessionSigs(litNodeClient);

	console.log("🔄 Executing AI Lit Action...");
	const litActionResponse = await litNodeClient.executeJs({
		sessionSigs: sessionSigs,
		code: aiActionCode,
		jsParams: {
			publicKey: LIT_PKP_PUBLIC_KEY!,
			sigName: "sig",
			metrics: metrics,
			amount_threshold: amt_threshold,
			apiKey: process.env.OPENAI_API_KEY,
		},
	});
	console.log("✅ Executed AI Lit Action");
	return JSON.parse(litActionResponse.response as string);
}
