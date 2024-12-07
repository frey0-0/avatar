const {
	LIT_NETWORK,
	LIT_RPC,
	LIT_ABILITY,
} = require("@lit-protocol/constants");
const { LitNodeClient } = require("@lit-protocol/lit-node-client");
const { LitContracts } = require("@lit-protocol/contracts-sdk");
const {
	LitAccessControlConditionResource,
	createSiweMessage,
	generateAuthSig,
} = require("@lit-protocol/auth-helpers");
const ethers = require("ethers");

const ETHEREUM_PRIVATE_KEY = process.env.PVT_KEY;

const getSessionSigsViaAuthSig = async (capacityTokenId) => {
	let litNodeClient;

	try {
		const ethersSigner = new ethers.Wallet(
			ETHEREUM_PRIVATE_KEY,
			new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
		);

		console.log("🔄 Connecting LitNodeClient to Lit network...");
		litNodeClient = new LitNodeClient({
			litNetwork: LIT_NETWORK.DatilTest,
			debug: false,
		});
		await litNodeClient.connect();
		console.log("✅ Connected LitNodeClient to Lit network");

		console.log("🔄 Connecting LitContracts client to network...");
		const litContracts = new LitContracts({
			signer: ethersSigner,
			network: LIT_NETWORK.DatilTest,
			debug: false,
		});
		await litContracts.connect();
		console.log("✅ Connected LitContracts client to network");

		if (!capacityTokenId) {
			console.log("🔄 Minting Capacity Credits NFT...");
			capacityTokenId = (
				await litContracts.mintCapacityCreditsNFT({
					requestsPerKilosecond: 10,
					daysUntilUTCMidnightExpiration: 1,
				})
			).capacityTokenIdStr;
			console.log(`✅ Minted new Capacity Credit with ID: ${capacityTokenId}`);
		}

		console.log("🔄 Creating capacityDelegationAuthSig...");
		const { capacityDelegationAuthSig } =
			await litNodeClient.createCapacityDelegationAuthSig({
				dAppOwnerWallet: ethersSigner,
				capacityTokenId,
				delegateeAddresses: [ethersSigner.address],
				uses: "1",
			});
		console.log(`✅ Created the capacityDelegationAuthSig`);

		console.log("🔄 Getting Session Sigs via an Auth Sig...");
		const sessionSignatures = await litNodeClient.getSessionSigs({
			chain: "ethereum",
			expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
			capabilityAuthSigs: [capacityDelegationAuthSig],
			resourceAbilityRequests: [
				{
					resource: new LitAccessControlConditionResource("*"),
					ability: LIT_ABILITY.AccessControlConditionDecryption,
				},
			],
			authNeededCallback: async ({
				uri,
				expiration,
				resourceAbilityRequests,
			}) => {
				const toSign = await createSiweMessage({
					uri,
					expiration,
					resources: resourceAbilityRequests,
					walletAddress: await ethersSigner.getAddress(),
					nonce: await litNodeClient.getLatestBlockhash(),
					litNodeClient,
				});

				return await generateAuthSig({
					signer: ethersSigner,
					toSign,
				});
			},
		});
		console.log("✅ Got Session Sigs via an Auth Sig");
		return sessionSignatures;
	} catch (error) {
		console.error(error);
	} finally {
		if (litNodeClient) {
			litNodeClient.disconnect();
		}
	}
};

module.exports = {
	getSessionSigsViaAuthSig,
};
