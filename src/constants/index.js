import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Web3Provider
export const easProvider = async () => {
  if (window.ethereum) {
    // await window.ethereum.request({ method: "eth_requestAccounts" });
    return new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL
    );
  } else {
    throw new Error("Ethereum provider not available");
  }
};
// export const easProvider = async () => {
//   if (window.ethereum) {
//     await window.ethereum.request({ method: "eth_requestAccounts" });
//     return new ethers.providers.Web3Provider(window.ethereum);
//   } else {
//     throw new Error("Ethereum provider not available");
//   }
// };

// Get signer from the provider
// export const easSigner = async () => {
//   const provider = await easProvider();
//   return provider.getSigner();
// };

export const easContractAddress = "0x4200000000000000000000000000000000000021"; // OP Sepolia v0.26
export const userSchemaUID =
  "0xf35fa2d095ccffae542b34d6c93517447dc5b86b73029bab58a7b337f3a4b4e4";
export const postSchemaUID =
  "0xee7db9351cddafb02e6a29ba5f1ac062a2bf741f1f7a9d4bf5b1aa69cab4e9a7";
export const reactionSchemaUID =
  "0xbbd7ed70dd8e4f8069f67760ba854e2a9b8355c7df12ef795d229c96be68ae45";
