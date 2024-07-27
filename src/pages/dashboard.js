import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import { useRouter } from "next/router";

export default function Dashboard() {
  const { userAddress } = useGlobalContext();
  const [formData, setFormData] = useState({
    theme: "",
    content: "",
  });

  const [postStatus, setPostStatus] = useState(null); // null, 'approved', 'pending', 'not-posted'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPostStatus = async () => {
      if (userAddress) {
        try {
          const response = await fetch(
            "http://localhost:3001/check-post-status",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userAddress }),
            }
          );

          const data = await response.json();

          if (data.posted) {
            setPostStatus(data.approved ? "approved" : "pending");
          } else {
            setPostStatus("not-posted");
          }
        } catch (error) {
          console.error("Error checking post status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkPostStatus();
  }, [userAddress]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/create-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, author: userAddress }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Post created successfully");
        // Redirect or update UI accordingly
      } else {
        alert("Post creation failed: " + data.message);
      }
    } catch (error) {
      console.error("There was an error with post creation:", error);
      alert("Post creation failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4">Create Post</h1>
        {!userAddress ? (
          <WalletConnect />
        ) : postStatus === "approved" ? (
          <p className="text-green-500">Your post has been approved!</p>
        ) : postStatus === "pending" ? (
          <p className="text-yellow-500">
            Your post is still pending approval.
          </p>
        ) : (
          <>
            <p className="mb-4 text-green-500">
              Connected Wallet: {userAddress}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="theme"
                >
                  Theme
                </label>
                <input
                  type="text"
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="content"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Create Post
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
