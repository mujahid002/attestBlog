import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import { useRouter } from "next/router";

export default function Admin() {
  const { userAddress, adminAddress } = useGlobalContext();
  const [registrations, setRegistrations] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disabledButtons, setDisabledButtons] = useState({});
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      if (!userAddress) {
        // Redirect to home if wallet is not connected
        router.push("/");
        return;
      } else if (userAddress.toLowerCase() !== adminAddress.toLowerCase()) {
        // Redirect to home if not admin
        router.push("/");
        return;
      }

      fetchRegistrations();
      fetchPosts();
    };

    checkUserAndFetch();
  }, [userAddress, adminAddress, router]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/get-registrations");
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/get-posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRegistration = async (userAddress) => {
    setDisabledButtons((prev) => ({ ...prev, [userAddress]: true }));
    const response = await fetch("http://localhost:3001/approve-registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress, approved: true }),
    });

    const data = await response.json();
    if (data.success) {
      alert("User approved successfully");
      fetchRegistrations();
    } else {
      alert("Failed to approve user: " + data.message);
      setDisabledButtons((prev) => ({ ...prev, [userAddress]: false }));
    }
  };

  const handleDisapproveRegistration = async (userAddress) => {
    setDisabledButtons((prev) => ({ ...prev, [userAddress]: true }));
    const response = await fetch(
      "http://localhost:3001/disapprove-registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress }),
      }
    );

    const data = await response.json();
    if (data.success) {
      alert("User disapproved successfully");
      fetchRegistrations();
    } else {
      alert("Failed to disapprove user: " + data.message);
      setDisabledButtons((prev) => ({ ...prev, [userAddress]: false }));
    }
  };

  const handleApprovePost = async (author) => {
    setDisabledButtons((prev) => ({ ...prev, [author]: true }));
    const response = await fetch("http://localhost:3001/approve-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, approved: true }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Post approved successfully");
      fetchPosts();
    } else {
      alert("Failed to approve post: " + data.message);
      setDisabledButtons((prev) => ({ ...prev, [author]: false }));
    }
  };

  const handleDisapprovePost = async (author) => {
    setDisabledButtons((prev) => ({ ...prev, [author]: true }));
    const response = await fetch("http://localhost:3001/disapprove-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Post disapproved successfully");
      fetchPosts();
    } else {
      alert("Failed to disapprove post: " + data.message);
      setDisabledButtons((prev) => ({ ...prev, [author]: false }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-5xl flex space-x-4">
        <div className="w-1/2 bg-gray-50 p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">
            User Registrations
          </h2>
          {!userAddress ? (
            <WalletConnect />
          ) : loading ? (
            <div>Loading...</div>
          ) : (
            <ul>
              {registrations.map((reg) => (
                <li key={reg.userAddress} className="mb-4">
                  <div className="mb-2 text-black">
                    <strong>Username:</strong> {reg.username}
                  </div>
                  <div className="mb-2 text-black">
                    <strong>Bio:</strong> {reg.bio}
                  </div>
                  <div className="mb-2 text-black">
                    <strong>Profile Picture:</strong>{" "}
                    <img src={reg.profilePicture} alt="Profile" width={50} />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleApproveRegistration(reg.userAddress)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      disabled={disabledButtons[reg.userAddress]}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleDisapproveRegistration(reg.userAddress)
                      }
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      disabled={disabledButtons[reg.userAddress]}
                    >
                      Disapprove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-1/2 bg-gray-50 p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">Posts</h2>
          {!userAddress ? (
            <WalletConnect />
          ) : loading ? (
            <div>Loading...</div>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.author} className="mb-4">
                  <div className="mb-2 text-black">
                    <strong>Theme:</strong> {post.theme}
                  </div>
                  <div className="mb-2 text-black">
                    <strong>Content:</strong> {post.content}
                  </div>
                  <div className="mb-2 text-black">
                    <strong>Author:</strong> {post.author}
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleApprovePost(post.author)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      disabled={disabledButtons[post.author]}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDisapprovePost(post.author)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      disabled={disabledButtons[post.author]}
                    >
                      Disapprove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
