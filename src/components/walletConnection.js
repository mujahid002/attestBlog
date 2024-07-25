// components/WalletConnect.js
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useGlobalContext } from "../context/Store";

const WalletConnect = () => {
  const { userAddress, setUserAddress } = useGlobalContext();
  const [error, setError] = useState("");

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          const { chainId } = await provider.getNetwork();
          if (chainId !== 11155111) {
            // Optimism Sepolia chain ID
            await switchNetwork();
          }
          setUserAddress(accounts[0]);
        }
      }
    };

    checkWalletConnection();
  }, [setUserAddress]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const { chainId } = await provider.getNetwork();
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        if (chainId !== 11155111) {
          // Optimism Sepolia chain ID
          await switchNetwork();
        }
        const [address] = accounts;

        setUserAddress(address);
      } catch (error) {
        setError("Error connecting to MetaMask: " + error.message);
      }
    } else {
      setError(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  };

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa37dc" }], // Optimism Sepolia chain ID in hex
      });
    } catch (error) {
      setError("Failed to switch network: " + error.message);
    }
  };

  return (
    <div>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={connectWallet}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Connect Wallet
      </button>
    </div>
  );
};

export default WalletConnect;
