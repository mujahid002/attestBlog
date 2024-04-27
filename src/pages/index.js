import { useEffect, useState } from "react";
// import { attest } from "@/components/attest";
import { ethers } from "ethers";

import axios from "axios";

// import { connectWallet } from "@/components/connectWallet";
import { attest } from "@/components/attest";
import { handleUploadToPinata } from "@/components/pinata";
import { submitPassport } from "@/components/submitPassport";

export default function Home() {
  const [address, setAddress] = useState("");
  const [eligible, setEligible] = useState(false);
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
    }
  }

  const attestBlog = async () => {
    try {
      const blogTitle = document.getElementById("blogTitle").value;
      const blogCategory = document.getElementById("blogCategory").value;
      const blogContent = document.getElementById("blogContent").value;
      if (!blogTitle || !blogCategory || !blogContent || !address) {
        alert("Please fill in all fields");
        return;
      }
      alert(`Uploading with data:  ${blogTitle}`);
      const data = {
        Title: blogTitle,
        Category: blogCategory,
        Content: blogContent,
        Owner: address,
      };
      const cid = await handleUploadToPinata(data.Owner, JSON.stringify(data));
      if (cid === undefined) {
        alert("Failed to upload to Pinata: CID is undefined");
        return;
      }

      await attest(address, cid);

      await fetchUserData();

      document.getElementById("blogTitle").value = "";
      document.getElementById("blogCategory").value = "";
      document.getElementById("blogContent").value = "";
    } catch (error) {
      console.error("Error attesting blog:", error);
      alert("Failed to attest blog: " + error.message);
    }
  };
  const [userData, setUserData] = useState([]);

  const fetchUserData = async () => {
    try {
      const data = await axios.get(`http://localhost:7001/fetch-blog-attests`);
      if (!data) {
        return;
      }
      console.log("fetched data", data);
      setUserData(data.data);
    } catch (error) {
      console.error("Unable to run fetchUserData function: ", error);
    }
  };

  useEffect(() => {
    connectWallet();
    fetchUserData();
    setEligible(false);
  }, [address]);

  const handlePassport = async () => {
    try {
      const scorerId = document.getElementById("scorerId").value;
      console.log("The scorer Id is", scorerId);
      console.log("The address is", address);
      const data = await submitPassport(address, scorerId);

      if (data.status === "DONE") {
        if (data.score == 0) {
          alert(
            `Follow this link https://passport.gitcoin.co/#/ to increase your score for ${address}`
          );
        } else if (data.score > 5) {
          setEligible(true);
        } else {
          alert("Your Score should be greater than 5 To Write Blogs!");
        }
      } else {
        alert("Please Submit Your Passport correctly!");
      }
    } catch (error) {
      if (error.message === "Incorrect scorer ID provided.") {
        alert("Incorrect scorer ID provided. Please check and try again.");
      } else {
        // Handle other types of errors
        alert(
          "An error occurred while processing your request. Please try again later."
        );
      }
    }
  };

  return (
    <div className="text-black min-h-screen flex justify-center items-center bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <h1 className="pb-5 font-bold text-large">BLOG-ATTEST</h1>
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

          <div class="py-1 flex space-x-4">
            <div class="relative flex flex-col text-black">
              <input
                type="text"
                id="scorerId"
                placeholder="Enter your Scorer ID"
                class="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <button
                id="submitPassport"
                class="relative bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  handlePassport();
                }}
              >
                Submit Your Passport Only Once!
              </button>
            </div>
          </div>
          <a
            href="https://docs.passport.gitcoin.co/building-with-passport/passport-api/getting-access#getting-your-scorer-id"
            class="text-blue-900 font-medium text-bold"
          >
            Get Your ScoreId here!
          </a>

          <span id="userAddress" className="text-gray-700 mb-4"></span>
          <div className="flex space-x-4">
            {/* Blog Content form */}
            {eligible && (
              <div className="flex flex-col text-black">
                <input
                  type="text"
                  id="blogTitle"
                  placeholder="Blog Title"
                  // onChange={(event) => handleInputChange(event, setBlogTitle)}
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                  required
                />
                <input
                  type="text"
                  id="blogCategory"
                  placeholder="Blog Category"
                  // onChange={(event) => handleInputChange(event, setBlogCategory)}
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                  required
                />
                <input
                  type="text"
                  id="blogContent"
                  placeholder="Blog Content"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                  style={{ minHeight: "100px" }}
                  required
                />
                <button
                  id="sendMailButton"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={attestBlog}
                >
                  Attest Blog
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flex justify-center text-black">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">S.NO</th>
                <th className="px-4 py-2 bg-gray-200 text-black">Owner</th>
                {/* <th className="px-4 py-2 bg-gray-200 text-black">
                  Attested Blogs for {address.slice(0, 4)}...
                  {address.slice(-4)}
                </th> */}
                <th className="px-4 py-2 bg-gray-200 text-black">Data</th>
                {/* <th className="px-4 py-2 bg-gray-200 text-black">
                  AttestationUIDs
                </th> */}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(userData) && userData.length > 0 ? (
                userData.map((data, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {data.attestData.owner}
                    </td>
                    <td className="border px-4 py-2">
                      {data.attestData ? (
                        <div>
                          <div>
                            <strong>CID:</strong> {data.attestData.cid}
                          </div>
                          <div>
                            <strong>Attest UID:</strong>{" "}
                            {data.attestData.attestUID}
                          </div>
                        </div>
                      ) : (
                        "No attest data available"
                      )}
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
