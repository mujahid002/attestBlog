import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";

export default function Dashboard() {
  const { userAddress } = useGlobalContext();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4">Dashboard</h1>
      </div>
    </div>
  );
}
