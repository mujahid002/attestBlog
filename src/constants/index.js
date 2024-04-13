import {
  EAS,
  Offchain,
  SchemaEncoder,
  SchemaRegistry,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";

export const EASContractAddress = "0x4200000000000000000000000000000000000021"; // OP Sepolia v0.26

export const easProvider = ethers.providers.getDefaultProvider(
  process.env.NEXT_PUBLIC_OP_SEPOLIA_RPC_URL
);
export const easSigner = provider.getSigner();

export const schemaUID =
  "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";
