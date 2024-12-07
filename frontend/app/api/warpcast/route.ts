import { NobleEd25519Signer } from "@farcaster/hub-nodejs";
import { NextRequest } from "next/server";

// API route for GET /api/warpcast
export async function GET(req:NextRequest) {
  try {
    // Replace with your actual values
    const fid = 6841; // Replace with your FID
    const privateKey = 'replace_with_your_private_key'; // Replace
    const publicKey = 'replace_with_your_public_key'; // Replace

    // Convert the private key to a Uint8Array
    const privateKeyArray = new Uint8Array(Buffer.from(privateKey, 'hex')); // Assuming privateKey is in hex format
    const signer = new NobleEd25519Signer(privateKeyArray);

    // Construct the header
    const header = {
      fid,
      type: 'app_key',
      key: publicKey,
    };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');

    // Construct the payload (expires in 5 minutes)
    const payload = { exp: Math.floor(Date.now() / 1000) + 300 };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    // Sign the message
    const message = `${encodedHeader}.${encodedPayload}`;
    const signatureResult = await signer.signMessageHash(Buffer.from(message, 'utf-8'));
    if (signatureResult.isErr()) {
      throw new Error("Failed to sign message");
    }

    const encodedSignature = Buffer.from(signatureResult.value).toString("base64url");

    // Construct the auth token
    const authToken = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

    // Return the auth token
    return new Response(JSON.stringify({ authToken }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error generating auth token:', error);
    return new Response(JSON.stringify({ error: error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
