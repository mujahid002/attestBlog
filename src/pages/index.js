import { useEffect, useState } from "react";
import { ethers } from "ethers";

import "axios";
// import AsyncGrantedAccessFetcher from "@/components/grantAccess";
// import AsyncFetchContacts from "@/components/fetchContacts";

export default function Home() {
  const [address, setAddress] = useState("");
  const [currencyBalance, setCurrencyBalance] = useState("");
  const [email, setEmail] = useState("");
  const [protectedAddress, setProtectedAddress] = useState("");
  const [userData, setUserData] = useState([]);

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        throw new Error(
          "Your browser doesn't seem to support connecting to Ethereum wallets. Please consider using a compatible browser like Chrome, Firefox, or Brave with a wallet extension like MetaMask."
        );
      }

      const ethereum = window.ethereum;
      const provider = new ethers.BrowserProvider(ethereum);

      // Get current network details
      const network = await provider.getNetwork();

      const isOpSepNetwork = network.chainId === 11155420;

      // Request accounts securely (avoiding deprecated 'eth_requestAccounts')
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // Handle user rejection
      if (accounts.length === 0) {
        console.log("User rejected account connection.");
        return;
      }
      //     if (!isOpSepNetwork) {
      //       // User confirmation for switching network (recommended)
      //       const shouldSwitchNetwork = confirm(
      //         "This app requires OP Sepolia. Switch network?"
      //       );

      //       if (shouldSwitchNetwork) {
      //         try {
      //           // Attempt to switch using a standard provider method (if available)
      //           await ethereum.request({
      //             method: "wallet_switchEthereumChain",
      //             params: [
      //               {
      //                 chainId: "0xaa37dc",
      //               },
      //             ],
      //           });
      //           const [address] = accounts;
      //           setAddress(address);
      //           return;
      //         } catch (switchError) {
      //           // Handle potential switch errors gracefully
      //           console.error(
      //             "Failed to switch to OP Sepolia network:",
      //             switchError
      //           );
      //           alert(
      //             "Switching failed. Please switch to OP Sepolia manually in your wallet settings."
      //           );
      //           return;
      //         }
      //       } else {
      //         console.log("User declined network switch.");
      //         return; // Handle user declining network switch
      //       }
      // }
      const [address] = accounts;
      setAddress(address);

      // Subscribe to account changes
      ethereum.on("accountsChanged", (newAccounts) => {
        const newAddress = newAccounts.length > 0 ? newAccounts[0] : "";
        setAddress(newAddress); // Update address in your application
        console.log("Account changed, new address:", newAddress);
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // Handle other errors with specific messages
      alert(error.message); // Display the specific error message
    }
  }

  const attestBlog = async () => {
    // Get the values of address, subject, and content from the input fields
    const title = document.getElementById("blogTitle").value;
    const subject = document.getElementById("blogCategory").value;
    const content = document.getElementById("blogContent").value;
    if (!title || !subject || !content) {
      alert("Please fill in all fields");
      return;
    }

    document.getElementById("blogTitle").value = "";
    document.getElementById("blogCategory").value = "";
    document.getElementById("blogContent").value = "";

    alert("Email sent successfully", sendEmail.taskId);
  };

  useEffect(() => {
    connectWallet();
  }, [address]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {address.length === 0 ? (
            <button
              id="connectWalletButton"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
              onClick={() => connectWallet()}
            >
              Connect Wallet
            </button>
          ) : (
            <p className="text-gray-700 text-lg">{address}</p>
          )}

          <span id="userAddress" className="text-gray-700 mb-4"></span>
          <div className="flex space-x-4">
            {/* Blog Content form */}
            <div className="flex flex-col text-black">
              <input
                type="text"
                placeholder="Blog Title"
                id="blogTitle"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Blog Category"
                id="blogCategory"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Blog Content"
                id="blogContent"
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <button
                id="sendMailButton"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => attestBlog()}
              >
                Attest Blog
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flex justify-center text-black">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Data Addresses for {address}
                </th>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Access Count
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((data, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{data.address}</td>
                    <td className="border px-4 py-2">
                      {/* <AsyncGrantedAccessFetcher dataAddress={data.address} /> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-4 py-2" colSpan="2">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
