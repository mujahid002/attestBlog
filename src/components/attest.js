import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";

export const attestOnChain = async (data) => {
  try {
    if (!data) {
      throw new Error("Invalid input parameters");
    }
    if (!data.canPost) {
      throw new Error("User Cannot Attest with this Data");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider:", provider);

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const signer = await provider.getSigner(data.Owner);
    console.log("Signer:", signer);

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID =
      "0x4a56b373bd7d6804deb561b60eed5b6a981fac23b45fa800f38d53e91bb9f121";

    // Initialize EAS instance
    const eas = new EAS150(easContractAddress);

    // Connect signer to EAS instance
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
      "string Title, address Owner, bool canPost"
    );
    const encodedData = schemaEncoder.encodeData([
      { name: "Title", value: data.Title, type: "string" },
      { name: "Owner", value: data.Owner, type: "address" },
      { name: "canPost", value: data.canPost, type: "bool" },
    ]);

    // Attest the data
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: data.Owner,
        // expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    // Store the attestation data (assuming axios exists)
    const attestedData = {
      postData: data,
      attestUID: newAttestationUID,
    };

    const res = await axios.post(
      "http://localhost:7001/store-attest",
      {
        attestedData: attestedData,
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
    console.error("Unable to run OnChain Attest: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
export const attestOffChain = async (data) => {
  try {
    if (!data) {
      throw new Error("Invalid input parameters");
    }
    if (!data.canPost) {
      throw new Error("User Cannot Attest with this Data");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider:", provider);

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const signer = await provider.getSigner(data.Owner);
    console.log("Signer:", signer);

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID =
      "0x4a56b373bd7d6804deb561b60eed5b6a981fac23b45fa800f38d53e91bb9f121";

    // Initialize EAS instance
    const eas = new EAS150(easContractAddress);

    const offchain = await eas.getOffchain();

    // Connect signer to EAS instance
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
      "string Title, address Owner, bool canPost"
    );
    const encodedData = schemaEncoder.encodeData([
      { name: "Title", value: data.Title, type: "string" },
      { name: "Owner", value: data.Owner, type: "address" },
      { name: "canPost", value: data.canPost, type: "bool" },
    ]);

    // Attest the data
    const tx = await offchain.signOffchainAttestation(
      {
        recipient: data.Owner,
        // Unix timestamp of when attestation expires. (0 for no expiration)
        // expirationTime: 0,
        revocable: true, // Be aware that if your schema is not revocable, this MUST be false
        schema: schemaUID,
        data: encodedData,
      },
      signer
    );

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    // Store the attestation data (assuming axios exists)
    const attestedData = {
      postData: data,
      attestUID: newAttestationUID,
    };

    const res = await axios.post(
      "http://localhost:7001/store-attest",
      {
        attestedData: attestedData,
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
    console.error("Unable to run Offchain Attest: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
