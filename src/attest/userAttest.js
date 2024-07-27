import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { easContractAddress, userSchemaUID } from "@/constants/index";

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
      schema: userSchemaUID,
      data: {
        recipient: data.Owner,
        // expirationTime: 0,
        revocable: true,
        data: encodedData,
      },
    });

    const userAttestationID = await tx.wait();

    console.log("User attestation UID:", userAttestationID);
    return userAttestationID;
  } catch (error) {
    console.error("Unable to run OnChain Attest: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
