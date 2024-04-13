import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
const easContractAddress = "0x4200000000000000000000000000000000000021";
const schemaUID =
  "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";
const eas = new EAS(easContractAddress);
// Signer must be an ethers-like signer.
await eas.connect(signer);
// Initialize SchemaEncoder with the schema string
const schemaEncoder = new SchemaEncoder("address Creator,string ContentID");
const encodedData = schemaEncoder.encodeData([
  {
    name: "Creator",
    value: "0x0000000000000000000000000000000000000000",
    type: "address",
  },
  { name: "ContentID", value: "", type: "string" },
]);
const tx = await eas.attest({
  schema: schemaUID,
  data: {
    recipient: "0x0000000000000000000000000000000000000000",
    expirationTime: 0,
    revocable: true, // Be aware that if your schema is not revocable, this MUST be false
    data: encodedData,
  },
});
const newAttestationUID = await tx.wait();
console.log("New attestation UID:", newAttestationUID);
