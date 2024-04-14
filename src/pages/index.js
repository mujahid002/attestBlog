import { useEffect, useState } from "react";
// import { attest } from "@/components/attest";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import axios from "axios";

export default function Home() {
  const [address, setAddress] = useState("");
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
    }
  }

  const attest = async (userAddress, blogId) => {
    try {
      if (!userAddress || !blogId) {
        throw new Error("Invalid input parameters");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider:", provider);

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const signer = await provider.getSigner(address);
      console.log("Signer:", signer);

      // const txn = await signer.sendTransaction({
      //   to: "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
      //   value: "10000000000000000",
      // });

      // console.log("Sent 0.01 to 0x1c", txn.hash);

      const easContractAddress = "0x4200000000000000000000000000000000000021";
      const schemaUID =
        "0x08cf4bbd043399f5b4ac08c48204c0f4cd7a3cb939ec7a1da08cb5e010e65193";

      // Initialize EAS instance
      const eas = new EAS(easContractAddress);

      // Connect signer to EAS instance
      eas.connect(signer);

      // Initialize SchemaEncoder with the schema string
      const schemaEncoder = new SchemaEncoder(
        "address Creator, string ContentID"
      );
      const encodedData = schemaEncoder.encodeData([
        { name: "Creator", value: userAddress, type: "address" },
        { name: "ContentID", value: blogId, type: "string" },
      ]);

      // Attest the data
      const tx = await eas.attest({
        schema: schemaUID, // Replace with your schema identifier
        data: {
          recipient: userAddress,
          // expirationTime: 0,
          revocable: true,
          data: encodedData,
        },
      });

      const newAttestationUID = await tx.wait();

      console.log("New attestation UID:", newAttestationUID);

      // Store the attestation data (assuming axios exists)
      const data = {
        owner: userAddress,
        cid: blogId,
        attestUID: newAttestationUID,
      };

      const res = await axios.post(
        "http://localhost:7001/store-attest", // Replace with your backend URL
        {
          attestData: data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        return "Success"; // Indicate success
      } else {
        throw new Error("Internal Server Error");
      }
    } catch (error) {
      console.error("Unable to run Attest: ", error);
      throw error; // Rethrow the error for handling in the calling function
    }
  };

  const handleUploadToPinata = async (data) => {
    try {
      if (!data) {
        throw new Error("Invalid Data!");
      }

      // Convert JSON object to blob
      const jsonData = JSON.stringify(data);
      const blobData = new Blob([jsonData], { type: "application/json" });

      const form = new FormData();
      form.append("file", blobData, "data.json");

      const metadata = JSON.stringify({
        name: `${data.Owner}`,
      });
      form.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      form.append("pinataOptions", options);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: form,
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to upload file to Pinata: ${res.statusText}`);
      }

      const resData = await res.json();

      console.log("the response is: ", resData.IpfsHash);

      return resData.IpfsHash;
    } catch (error) {
      console.error(error);
      throw new Error("Unable to upload file to Pinata");
    }
  };

  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("");
  const [blogContent, setBlogContent] = useState("");

  const handleInputChange = (event, setterFunction) => {
    setterFunction(event.target.value);
  };

  const adjustInputSize = (event) => {
    const inputElement = event.target;
    inputElement.style.height = "auto";
    inputElement.style.height = inputElement.scrollHeight + "px";
  };

  const attestBlog = async () => {
    if (!blogTitle || !blogCategory || !blogContent || !address) {
      alert("Please fill in all fields");
      return;
    }

    try {
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

      setBlogTitle("");
      setBlogCategory("");
      setBlogContent("");
    } catch (error) {
      console.error("Error attesting blog:", error);
      alert("Failed to attest blog: " + error.message);
    }
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
                value={blogTitle}
                onChange={(event) => handleInputChange(event, setBlogTitle)}
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <input
                type="text"
                placeholder="Blog Category"
                value={blogCategory}
                onChange={(event) => handleInputChange(event, setBlogCategory)}
                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              />
              <textarea
                placeholder="Blog Content"
                value={blogContent}
                onChange={(event) => {
                  handleInputChange(event, setBlogContent);
                  adjustInputSize(event);
                }}
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
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flex justify-center text-black">
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Attested Blogs for {address}
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
