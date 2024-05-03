import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";
export const comment = async (data) => {
  try {
    if (!data) {
      throw new Error("Invalid input parameters");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider:", provider);

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const signer = await provider.getSigner(data.Owner);
    console.log("Signer:", signer);

    const easContractAddress = "0x4200000000000000000000000000000000000021";
    const schemaUID =
      "0x00ff5451bcdbc5f65cefca74e7c39baffe605cf5e77844f619924eae82501eb9";

    // Initialize EAS instance
    const eas = new EAS150(easContractAddress);

    // Connect signer to EAS instance
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("string review");
    const encodedData = schemaEncoder.encodeData([
      { name: "review", value: data.comment, type: "string" },
    ]);

    // Attest the data
    const tx = await eas.attest({
      schema: schemaUID,
      data: {
        recipient: data.commenter,
        refUID: data.attestedData.attestData.attestUID,
        revocable: true,
        data: encodedData,
      },
    });

    const newAttestationUID = await tx.wait();

    console.log("New attestation UID:", newAttestationUID);

    // Store the attestation data (assuming axios exists)
    const attestedComment = {
      commentData: data,
      attestUID: newAttestationUID,
    };

    const res = await axios.post(
      "http://localhost:7001/store-comment",
      {
        attestedComment: attestedComment,
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
