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

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // OP Sepolia v0.26
export const schemaUID =
  "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";
