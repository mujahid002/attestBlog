import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { easSigner, schemaUID } from "@/constants/index";

export const attest = async (userAddress, blogId) => {
  try {
  } catch (error) {
    console.error("Unable to run Attest: ", error);
  }
  const eas = new EAS(EASContractAddress);
  eas.connect(easSigner);

  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("address Creator, string ContentID");
  const encodedData = schemaEncoder.encodeData([
    { name: "Creator", value: userAddress, type: "address" },
    { name: "ContentID", value: blogId, type: "string" },
  ]);

  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: userAddress,
      //   expirationTime: 0,
      revocable: true,
      data: encodedData,
    },
  });

  const newAttestationUID = await tx.wait();

  console.log("New attestation UID:", newAttestationUID);
};
