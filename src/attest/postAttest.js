import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { easContractAddress, postSchemaUID } from "@/constants/index";

export const postAttest = async (data) => {
  try {
    if (!data) {
      throw new Error("Invalid input parameters");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("Provider:", provider);

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const signer = await provider.getSigner();
    console.log("Signer:", signer);

    // Initialize EAS instance
    const eas = new EAS150(easContractAddress);

    // Connect signer to EAS instance
    eas.connect(signer);

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder(
      "string theme, string content, string author, uint256 timestamp, bool approved"
    );
    const encodedData = schemaEncoder.encodeData([
      { name: "theme", value: data.theme, type: "string" },
      { name: "content", value: data.content, type: "string" },
      { name: "author", value: data.owner, type: "string" },
      { name: "timestamp", value: BigInt(data.timestamp), type: "uint256" },
      { name: "approved", value: data.approved, type: "bool" },
    ]);

    // Attest the data
    const tx = await eas.attest({
      schema: postSchemaUID,
      data: {
        recipient: data.owner,
        revocable: true,
        data: encodedData,
      },
    });
    const postAttestationID = await tx.wait();

    console.log("Post attestation UID:", postAttestationID);
    return postAttestationID;
  } catch (error) {
    console.error("Unable to run OnChain Attest: ", error);
    throw error; // Rethrow the error for handling in the calling function
  }
};
