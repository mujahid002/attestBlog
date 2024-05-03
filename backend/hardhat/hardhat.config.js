require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.23",
  networks: {
    optimismSepolia: {
      url: process.env.OP_SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155420,
      // gasPrice: "auto",
      // gas: 5000000,
      timeout: 10000,
      confirmations: 2,
    },
  },
  etherscan: {
    apiKey: {
      optimismSepolia: process.env.OP_SEPOLIA_API_KEY,
    },
    customChains: [
      {
        network: "optimismSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimistic.etherscan.io",
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },
};
