import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORK, LIT_RPC } from "@lit-protocol/constants";
import * as ethers from "ethers";
import { LitContracts } from "@lit-protocol/contracts-sdk";

const litNodeClient = new LitNodeClient({
	litNetwork: LIT_NETWORK.DatilDev,
	debug: false,
});
await litNodeClient.connect();

const ethersWallet = new ethers.Wallet(
	"7200b43a82c49b6923d41d59e1b211051badb8d1102b7a35c258a87bd274b164", // Replace with your private key
	new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

const litContracts = new LitContracts({
	signer: ethersWallet,
	network: LIT_NETWORK.DatilDev,
	debug: false,
});
await litContracts.connect();

const pkpInfo = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
