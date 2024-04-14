import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";
import { dotenv } from "dotenv";
// dotenv.config();

export const attest = async (userAddress, blogId) => {
  try {
    // Validate input parameters
    if (!userAddress || !blogId) {
      throw new Error("Invalid input parameters");
    }

    // Check for valid provider in browser environment
    if (!window.ethereum) {
      throw new Error(
        "No Ethereum provider detected. Please install MetaMask or connect a wallet."
      );
    }

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL
    );
    console.log("Provider:", provider);

    // Request user account connection
    // const accounts = await provider.send("eth_requestAccounts", []);

    // if (!accounts || accounts.length === 0) {
    //   throw new Error("Please connect your wallet to sign the transaction.");
    // }

    const signer = await provider.getSigner(userAddress);
    console.log("Signer:", signer);

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID =
      "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";

    // Initialize EAS instance
    const eas = new EAS(easContractAddress);

    // Connect signer to EAS instance
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
      "address Creator, string ContentID"
    );
    const encodedData = schemaEncoder.encodeData([
      { name: "Creator", value: userAddress, type: "address" },
      { name: "ContentID", value: blogId, type: "string" },
    ]);

    // Attest the data
    const tx = await eas.attest({
      schema: schemaUID, // Replace with your schema identifier
      data: {
        recipient: userAddress,
        // expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    // Store the attestation data (assuming axios exists)
    const data = {
      owner: userAddress,
      cid: blogId,
      attestUID: newAttestationUID,
    };

    const res = await axios.post(
      "http://localhost:7001/store-attest", // Replace with your backend URL
      {
        attestData: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (res.status === 200) {
      return "Success"; // Indicate success
    } else {
      throw new Error("Internal Server Error");
    }
  } catch (error) {
    console.error("Unable to run Attest: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
