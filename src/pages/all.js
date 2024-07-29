import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import { reactionAttest } from "@/attest/reactionAttest";

import {
  EAS as EAS150,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import { easContractAddress, provider } from "@/constants/index";

export default function All() {
  const { userAddress } = useGlobalContext();
  const [attestedUsers, setAttestedUsers] = useState([]);
  const [attestedPosts, setAttestedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState({});
  const [comments, setComments] = useState({});

  const [attestations, setAttestations] = useState([]);
  const [attestationDetails, setAttestationDetails] = useState([]);

  const fetchAttestations = async () => {
    try {
      const query = `
        query {
          schema(where: { id: "0xbbd7ed70dd8e4f8069f67760ba854e2a9b8355c7df12ef795d229c96be68ae45" }) {
            attestations {
              id
            }
          }
        }
      `;

      const response = await fetch(
        "https://optimism-sepolia.easscan.org/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        }
      );

      const result = await response.json();
      const attestationIds = result.data.schema.attestations.map((a) => a.id);
      console.log("attestationIds", attestationIds);
      setAttestations(attestationIds);

      const eas = new EAS150(easContractAddress);
      eas.connect(provider);
      const d = [];
      attestations.map(async (uid) => {
        const attestation = await eas.getAttestation(uid);
        d.push(attestation);
      });
      setAttestationDetails(d);
    } catch (error) {
      console.error("Error fetching attestations:", error);
    }
  };
  const fetchAttestedData = async () => {
    try {
      const [usersResponse, postsResponse] = await Promise.all([
        fetch("http://localhost:3001/get-registrations"),
        fetch("http://localhost:3001/get-posts"),
      ]);

      const usersData = await usersResponse.json();
      const postsData = await postsResponse.json();

      setAttestedUsers(usersData.filter((user) => user.attestationId));
      setAttestedPosts(postsData.filter((post) => post.attestationId));
    } catch (error) {
      console.error("Error fetching attested data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAttestedData();
    fetchAttestations();
  }, []);

  const handleCommentChange = (type, id, event) => {
    setComments({
      ...comments,
      [`${type}-${id}`]: event.target.value,
    });
  };

  const handleReactionAttest = async (type, id) => {
    if (!userAddress) {
      alert("Please connect input wallet to react.");
      return;
    }

    const comment = comments[`${type}-${id}`];
    if (!comment) {
      alert("Please enter a comment before attesting.");
      return;
    }

    try {
      let attestationId = "";
      if (type === "user") {
        attestationId = await fetchUserData(id); // Fetch user data and get attestationId
      } else {
        attestationId = await fetchPostData(id); // Fetch post data and get attestationId
      }
      if (attestationId.length === 0) {
        return;
      }

      const attestationData = {
        owner: userAddress,
        post: attestationId,
        reactionType: comment,
      };

      console.log("The Data is", attestationData);

      const reactionAttestationId = await reactionAttest(attestationData);

      const response = await fetch(`http://localhost:3001/react-to-${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attestationId,
          reactionAttestationId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setReactions((prevReactions) => ({
          ...prevReactions,
          [`${type}-${id}`]: true,
        }));
        alert(`Reaction to ${type} successful!`);
      } else {
        alert(`Failed to react to ${type}: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error reacting to ${type}:`, error);
      alert(`Error reacting to ${type}. Please try again.`);
    }
  };

  const fetchUserData = async (userId) => {
    // Fetch user data from backend
    const response = await fetch(
      // `http://localhost:3001/get-user-data-by-id?userId=${userId}`,
      `http://localhost:3001/get-user-data?userAddress=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to fetch user data: " + data.message);
    }
    return data.userData.attestationId;
  };

  const fetchPostData = async (postId) => {
    // Fetch post data from backend
    const response = await fetch(
      `http://localhost:3001/get-post-data?postId=${postId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching post data: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("Failed to fetch post data: " + data.message);
    }

    return data.postData.attestationId;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!userAddress && <WalletConnect />}
      <div className="w-full max-w-7xl bg-white p-6 rounded-lg shadow-md flex space-x-4 overflow-x-auto">
        <div className="w-1/2 p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">Attested Users</h2>
          <div className="grid grid-cols-3 gap-4">
            {attestedUsers.map((user) => (
              <div
                key={user.userAddress}
                className="bg-gray-200 p-4 rounded-lg"
              >
                <div className="mb-2 text-black">
                  <strong>Username:</strong> {user.username}
                </div>
                <div className="mb-2 text-black">
                  <strong>Bio:</strong> {user.bio}
                </div>
                <div className="mb-2 text-black">
                  <strong>Profile Picture:</strong>
                  <img src={user.profilePicture} alt="Profile" width={50} />
                </div>
                <input
                  type="text"
                  id="comment"
                  name="comment"
                  placeholder="Type comment..."
                  value={comments[`user-${user.userAddress}`] || ""}
                  onChange={(e) =>
                    handleCommentChange("user", user.userAddress, e)
                  }
                  className="text-gray-700 w-full mb-2 p-2 border rounded"
                  required
                />
                <button
                  onClick={() => handleReactionAttest("user", user.userAddress)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={reactions[`user-${user.userAddress}`]}
                >
                  Attest Reaction
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/2 p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">Attested Posts</h2>
          <div className="grid grid-cols-3 gap-4">
            {attestedPosts.map((post) => (
              <div key={post._id} className="bg-gray-200 p-4 rounded-lg">
                <div className="mb-2 text-black">
                  <strong>Theme:</strong> {post.theme}
                </div>
                <div className="mb-2 text-black">
                  <strong>Content:</strong> {post.content}
                </div>
                <div className="mb-2 text-black">
                  <strong>Author:</strong> {post.userDetails.username}
                </div>
                <input
                  type="text"
                  id="postComment"
                  name="comment"
                  placeholder="Type comment..."
                  value={comments[`post-${post._id}`] || ""}
                  onChange={(e) => handleCommentChange("post", post._id, e)}
                  className="text-gray-700 w-full mb-2 p-2 border rounded"
                  required
                />
                <button
                  onClick={() => handleReactionAttest("post", post._id)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={reactions[`post-${post._id}`]}
                >
                  Attest Reaction
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="w-full p-4 rounded-lg shadow-lg overflow-y-auto h-96 mt-6">
        <h2 className="text-xl text-black font-bold mb-4">
          Attestation Reactions
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {attestationDetails.map((attestation) => (
            <div key={attestation.id} className="bg-gray-200 p-4 rounded-lg">
              <div className="mb-2 text-black">
                <strong>ID:</strong> {attestation.id}
              </div>
              <div className="mb-2 text-black">
                <strong>Data:</strong> {attestation.data}
              </div>
              <div className="mb-2 text-black">
                <strong>Timestamp:</strong>{" "}
                {new Date(attestation.timestamp * 1000).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
