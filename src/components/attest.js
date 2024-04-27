import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";


export const attest = async (userAddress, blogId) => {
  try {
    if (!userAddress || !blogId) {
      throw new Error("Invalid input parameters");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider:", provider);

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const signer = await provider.getSigner(address);
    console.log("Signer:", signer);

    // const txn = await signer.sendTransaction({
    //   to: "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
    //   value: "10000000000000000",
    // });

    // console.log("Sent 0.01 to 0x1c", txn.hash);

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID =
      "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";

    // Initialize EAS instance
    const eas = new EAS150(easContractAddress);

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
