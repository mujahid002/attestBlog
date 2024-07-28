import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { easContractAddress, userSchemaUID } from "@/constants/index";

export const userAttest = async (data) => {
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
      "string userName, string bio, string profilePicture, uint256 timestamp, bool approved"
    );
    const encodedData = schemaEncoder.encodeData([
      { name: "userName", value: data.userName, type: "string" },
      { name: "bio", value: data.bio, type: "string" },
      { name: "profilePicture", value: data.profilePicture, type: "string" },
      { name: "timestamp", value: BigInt(data.timestamp), type: "uint256" },
      { name: "approved", value: data.approved, type: "bool" },
    ]);

    // Attest the data
    const tx = await eas.attest({
      schema: userSchemaUID,
      data: {
        recipient: data.owner,
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
