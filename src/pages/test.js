import { useEffect, useState } from "react";
// import { attest } from "@/components/attest";
import { ethers } from "ethers";

import axios from "axios";

// import { connectWallet } from "@/components/connectWallet";
import { attestOnChain, attestOffChain } from "@/components/attest";
import { handleUploadToPinata } from "@/components/pinata";
import { submitPassport } from "@/components/submitPassport";
import { comment } from "@/components/comment";

export default function Home() {
  const [address, setAddress] = useState("");
  const [admin, setAdmin] = useState(
    "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5"
  );
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

  const postData = async () => {
    try {
      const postThought = document.getElementById("postThought").value;
      if (!postThought || !address) {
        alert("Please fill in all fields");
        return;
      }
      alert(`Uploading with data:  ${postThought}`);
      const data = {
        Title: postThought,
        Owner: address,
        canPost: false,
      };

      const res = await axios.post(
        "http://localhost:7001/store-post",
        {
          postData: data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        await fetchUserData(address);
        document.getElementById("postThought").value = "";
        return "Success";
      } else {
        await fetchUserData(address);
        document.getElementById("postThought").value = "";
        throw new Error("Internal Server Error");
      }
      // const data = {
      //   Title: postThought,
      //   Category: blogCategory,
      //   Content: blogContent,
      //   Owner: address,
      // };
      // const cid = await handleUploadToPinata(data.Owner, JSON.stringify(data));
      // if (cid === undefined) {
      //   alert("Failed to upload to Pinata: CID is undefined");
      //   return;
      // }

      // await attest(address, cid);
    } catch (error) {
      console.error("Error posting Data:", error);
      // alert("Failed to post data: " + error.message);
    }
  };
  const [userData, setUserData] = useState([]);
  const [adminData, setAdminData] = useState([]);
  const [attestedData, setAttestedData] = useState([]);

  const fetchUserData = async (address) => {
    try {
      const data = await axios.get(
        `http://localhost:7001/fetch-post-data?userAddress=${address}`
      );
      if (!data) {
        return;
      }
      console.log("fetched data", data.data[0].postData);
      setUserData(data.data);
    } catch (error) {
      console.error("Unable to run fetchUserData function: ", error);
    }
  };
  const fetchAdminData = async () => {
    try {
      const data = await axios.get(`http://localhost:7001/fetch-posts`);
      if (!data) {
        return;
      }
      console.log("fetched data", data.data[0].postData);
      setAdminData(data.data);
    } catch (error) {
      console.error("Unable to run fetchAdminData function: ", error);
    }
  };
  const fetchAttestedData = async () => {
    try {
      const response = await axios.get("http://localhost:7001/fetch-attests");

      if (!response.data || !Array.isArray(response.data)) {
        console.log("No data received or invalid data format");
        return;
      }

      const fetchedData = response.data;
      console.log("Fetched attested data:", fetchedData);
      // Assuming setAttestedData is a function to set state in React
      setAttestedData(fetchedData);

      // If you need to process each JSON object individually, you can iterate over the array
      fetchedData.forEach((jsonObject, index) => {
        console.log(`JSON object ${index + 1}:`, jsonObject);
      });
    } catch (error) {
      console.error("Unable to fetch attested data:", error);
    }
  };

  const [isChecked, setIsChecked] = useState([]);

  // Function to handle checkbox change
  const handleCheckboxChange = (index) => {
    const updatedChecked = [...isChecked]; // Copy the current state array
    updatedChecked[index] = !updatedChecked[index]; // Toggle the checkbox state at the specified index
    setIsChecked(updatedChecked); // Update the state
  };
  const handleReason = async (index) => {
    try {
      const reasonInput = document.getElementById(`reason_${index}`).value; // Get the value of the reason input
      const isCheckedValue = isChecked[index]; // Get the checked state of the corresponding checkbox
      if (!reasonInput) {
        alert("Please fill in all fields");
        return;
      }
      console.log(`Reason: ${reasonInput}, Checked: ${isCheckedValue}`);

      const id = userData[index]._id;

      console.log("THE USER DATA IS", userData[index].postData);

      const data = {
        id: id,
        check: isCheckedValue,
        reason: reasonInput,
        Owner: userData[index].postData.Owner,
      };

      console.log("indexed data is", data);

      const res = await axios.post(
        "http://localhost:7001/update-post-data",
        {
          updateData: data,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        await fetchAdminData();
        document.getElementById(`reason_${index}`).value = "";
        return "Success";
      } else {
        await fetchAdminData();
        document.getElementById(`reason_${index}`).value = "";
        throw new Error("Internal Server Error");
      }
    } catch (error) {
      console.error("Unable to run handleReason function: ", error);
    }
  };

  const handleAttest = async (index) => {
    try {
      const data = userData[index].postData;
      console.log("attesting data is", data);
      await attestOnChain(data);
      // await attestOffChain(data);
    } catch (error) {
      console.error("Unable to run handleAttest", error);
    }
  };
  const handleComment = async (index) => {
    try {
      const commentInput = document.getElementById(`comment_${index}`).value;
      if (!commentInput) {
        alert("Please fill in comment field");
        return;
      }
      const data = {
        commenter: address,
        comment: commentInput,
        attestedData: attestedData[index],
      };
      console.log("attesting data is", data);
      await comment(data);

      document.getElementById(`comment_${index}`).value = "";
    } catch (error) {
      console.error("Unable to run handleAttest", error);
    }
  };

  useEffect(() => {
    connectWallet();
    fetchUserData(address);
    fetchAdminData();
    fetchAttestedData();
    setAdmin("0x1c620232fe5ab700cc65bbb4ebdf15affe96e1b5");
    setEligible(false);
  }, [address]);

  const handlePassport = async () => {
    try {
      // const scorerId = document.getElementById("scorerId").value;
      // console.log("The scorer Id is", scorerId);
      console.log("The address is", address);
      const data = await submitPassport(address);

      if (data.status === "DONE") {
        if (data.score == 0) {
          alert(
            `Follow this link https://passport.gitcoin.co/#/ to increase your score for ${address}`
          );
        } else if (data.score > 5) {
          alert("Your Score is greater than 5, you can post!");
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
          <h1 className="pb-5 font-bold text-large">POST-COMMENT</h1>
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

          {address != admin ? (
            <div class="py-1 flex space-x-4">
              <div class="pt-5 relative flex flex-col text-black">
                {/* <input
                type="text"
                id="scorerId"
                placeholder="Enter your Scorer ID"
                class="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                required
              /> */}
                {address != admin && (
                  <button
                    id="submitPassport"
                    class="relative bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                      handlePassport();
                    }}
                  >
                    Check Eligibility to POST!
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div></div>
          )}
          {/* <a
            href="https://docs.passport.gitcoin.co/building-with-passport/passport-api/getting-access#getting-your-scorer-id"
            class="text-blue-900 font-medium text-bold"
          >
            Get Your ScoreId here!
          </a> */}

          <span id="userAddress" className="text-gray-700 mb-4"></span>
          <div className="flex space-x-4">
            {/* Blog Content form */}
            {eligible && (
              <div className="flex flex-col text-black">
                <input
                  type="text"
                  id="postThought"
                  placeholder="Post Your Thoughts"
                  className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                  required
                />
                {/* <input
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
                /> */}
                <button
                  id="sendMailButton"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={postData}
                >
                  Get Approval & Attest Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="mt-8 flex justify-center text-black">
          {address != admin ? (
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-200 text-black">S.NO</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">Owner</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">Content</th>
                  {/* <th className="px-4 py-2 bg-gray-200 text-black">
                  Attested Blogs for {address.slice(0, 4)}...
                  {address.slice(-4)}
                </th> */}
                  <th className="px-4 py-2 bg-gray-200 text-black">Status</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">Reason</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">
                    Can Attest
                  </th>
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
                        {data.postData.Owner.slice(0, 6)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.Title.slice(0, 6) + "..."}
                      </td>
                      <td className="border px-4 py-2">
                        {data.postData ? (
                          <div>
                            <div>
                              {/* <strong>CID:</strong>{" "} */}
                              {data.postData.canPost
                                ? "Approved"
                                : "Not Approved"}
                            </div>
                            {/* <div>
                            <strong>Attest UID:</strong>{" "}
                            {data.postData.attestUID}
                          </div> */}
                          </div>
                        ) : (
                          "No attest data available"
                        )}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.reason
                          ? data.postData.reason
                          : "Not Given"}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.canPost ? (
                          <button
                            id={`attestButton_${index}`} // Unique ID for each button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            style={{ minWidth: "10px" }}
                            onClick={() => handleAttest(index)} // Pass index to handleReason function
                          >
                            Attest
                          </button>
                        ) : (
                          <p>Nope</p>
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
          ) : (
            <table className="table-auto">
              <thead>
                <tr>
                  <th className="px-4 py-2 bg-gray-200 text-black">S.NO</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">Owner</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">Content</th>
                  <th className="px-4 py-2 bg-gray-200 text-black">
                    Update Status
                  </th>
                  <th className="px-4 py-2 bg-gray-200 text-black">
                    Given Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(adminData) && adminData.length > 0 ? (
                  adminData.map((data, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2 text-center">
                        {index + 1}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.Owner.slice(0, 6)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.Title.slice(0, 6)}
                      </td>
                      <td className="border px-4 py-2">
                        {data.postData ? (
                          <div>
                            <div className="flex flex-cols">
                              <input
                                type="text"
                                id={`reason_${index}`} // Unique ID for each input field
                                placeholder="Reason"
                                className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                                style={{ minHeight: "10px" }}
                                required
                              />
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`checkbox_${index}`} // Unique ID for each checkbox
                                  className="ml-2 mr-2 appearance-none h-6 w-6 border border-gray-300 rounded-md checked:bg-green-500 checked:border-transparent focus:outline-none cursor-pointer"
                                  checked={isChecked[index] || false} // Use isChecked array for individual checkbox state
                                  onChange={() => handleCheckboxChange(index)} // Pass index to handleCheckboxChange function
                                />
                              </div>
                              <button
                                id={`reasonButton_${index}`} // Unique ID for each button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                style={{ minWidth: "10px" }}
                                onClick={() => handleReason(index)} // Pass index to handleReason function
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          "No data available"
                        )}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {data.postData.reason
                          ? "Given Valid Reason"
                          : "Not Given"}
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
          )}
        </div>
        <div className="mt-8 flex justify-center text-black">
          {/* <h2>All Attested Data</h2> */}
          <table className="table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 bg-gray-200 text-black">S.NO</th>
                <th className="px-4 py-2 bg-gray-200 text-black">Owner</th>
                <th className="px-4 py-2 bg-gray-200 text-black">Content</th>
                {/* <th className="px-4 py-2 bg-gray-200 text-black">
                  Attested Blogs for {address.slice(0, 4)}...
                  {address.slice(-4)}
                </th> */}
                {/* <th className="px-4 py-2 bg-gray-200 text-black">Status</th> */}
                <th className="px-4 py-2 bg-gray-200 text-black">
                  Comment Attest
                </th>
                {/* <th className="px-4 py-2 bg-gray-200 text-black">
                  AttestationUIDs
                </th> */}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(attestedData) && attestedData.length > 0 ? (
                attestedData.map((data, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {data.attestData &&
                      data.attestData.postData &&
                      data.attestData.postData.Owner
                        ? data.attestData.postData.Owner.slice(0, 6)
                        : "Owner not available"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {data.attestData &&
                      data.attestData.postData &&
                      data.attestData.postData.Title
                        ? data.attestData.postData.Title.slice(0, 6) + "..."
                        : "Title not available"}
                    </td>
                    <td className="border px-4 py-2">
                      {data.attestData && data.attestData.postData ? (
                        <div className="flex flex-cols">
                          <input
                            type="text"
                            id={`comment_${index}`}
                            placeholder="Comment..."
                            className="rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:border-blue-500 mb-2"
                            style={{ minHeight: "10px" }}
                            required
                          />
                          <button
                            id={`commentButton_${index}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            style={{ minWidth: "10px" }}
                            onClick={() => handleComment(index)}
                          >
                            Comment
                          </button>
                        </div>
                      ) : (
                        "No data available"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-4 py-2" colSpan="4">
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
