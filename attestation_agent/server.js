import express from "express";  
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";  
import { ethers } from "ethers";  

// EAS and Ethereum setup  
const easContractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";  
const schemaUID = "0x417e7ac933ef1ac79862fa06044e1cdbb65ebd62e5f2ab5816899dad06edf459";  
const eas = new EAS(easContractAddress);  
const provider = ethers.getDefaultProvider("sepolia");  
const signer = new ethers.Wallet(  
  "a290bca74f3a742b5f87ddeeefe4c42eda9c0158acda2a3618b37382de1cd95d",  
  provider  
);  
await eas.connect(signer);  

// Initialize SchemaEncoder with the schema string  
const schemaEncoder = new SchemaEncoder("string agent_id,uint8 reputation,bool outlier");  

// Create an Express server  
const app = express();  
app.use(express.json()); // Middleware to parse JSON request bodies  

// Endpoint to handle attestations  
app.post("/attest", async (req, res) => {  
  try {  
    console.log("Received request to create attestation:", req.body);
    const { agent_id, reputation, outlier } = req.body;  

    // Validate input  
    if (typeof agent_id !== "string" || typeof reputation !== "number" || typeof outlier !== "boolean") {  
      return res.status(400).json({ error: "Invalid input data" });  
    }  

    // Encode the data  
    const encodedData = schemaEncoder.encodeData([  
      { name: "agent_id", value: agent_id, type: "string" },  
      { name: "reputation", value: reputation.toString(), type: "uint8" },  
      { name: "outlier", value: outlier, type: "bool" },  
    ]);  

    // Create the attestation  
    const tx = await eas.attest({  
      schema: schemaUID,  
      data: {  
        recipient: "0x0000000000000000000000000000000000000000", // Replace with actual recipient if needed  
        expirationTime: BigInt(0),  
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false  
        data: encodedData,  
      },  
    });  
    console.log("Attestation created:", tx);

    // Wait for the transaction to be mined  
    const newAttestationUID = await tx.wait();  
    console.log("Attestation mined:", newAttestationUID);
    // Respond with the attestation UID  
    res.json({ attestationUID: newAttestationUID });  
  } catch (error) {  
    console.error("Error creating attestation:", error);  
    res.status(500).json({ error: "Failed to create attestation" });  
  }  
});  

// Start the server  
const PORT = 9000;  
app.listen(PORT, () => {  
  console.log(`Server is running on http://localhost:${PORT}`);  
});  