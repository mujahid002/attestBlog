import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import { postAttest } from "../attest/postAttest"; // Assuming the userAttest function is in utils folder

export default function Dashboard() {
  const { userAddress } = useGlobalContext();
  const [formData, setFormData] = useState({
    theme: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const fetchUserPosts = async () => {
    if (userAddress) {
      try {
        const response = await fetch("http://localhost:3001/get-user-posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userAddress }),
        });

        const data = await response.json();

        if (data.success) {
          setPosts(data.posts ? data.posts : []);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPosts();
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
        fetchUserPosts();
      } else {
        alert("Post creation failed: " + data.message);
      }
    } catch (error) {
      console.error("There was an error with post creation:", error);
      alert("Post creation failed. Please try again.");
    }
  };

  const handlePostAttest = async (postId) => {
    try {
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

      const attestationData = {
        owner: userAddress,
        theme: data.postData.theme,
        content: data.postData.content,
        timestamp: data.postData.timestamp,
        approved: data.postData.approved,
      };

      const attestationId = await postAttest(attestationData);

      if (attestationId) {
        const updateResponse = await fetch(
          "http://localhost:3001/update-post-attestation",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ postId, attestationId }),
          }
        );

        const updateData = await updateResponse.json();
        if (updateData.success) {
          alert("Post attested successfully");
          fetchUserPosts();
        } else {
          alert("Failed to update attestation ID: " + updateData.message);
        }
      } else {
        alert("Attestation failed. Please try again.");
      }
    } catch (error) {
      console.error("There was an error with the post attestation:", error);
      alert("Post attestation failed. Please try again.");
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
            <h2 className="text-xl text-black font-bold mt-4">Your Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post._id} className="mb-4 p-4 bg-gray-200 rounded-lg">
                  <div className="mb-2 text-black">
                    <strong>Theme:</strong> {post.theme}
                  </div>
                  <div className="mb-2 text-black">
                    <strong>Content:</strong> {post.content}
                  </div>
                  {post.attestationId && post.attestationId.length > 0 ? (
                    <>
                      <div className="mb-2 text-green-500">
                        Your post is attested!
                      </div>
                      <button
                        onClick={() => router.push("/all-posts")}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Go to All Posts
                      </button>
                    </>
                  ) : post.approved ? (
                    <>
                      <div className="mb-2 text-green-500">
                        Your post is approved.
                      </div>
                      <button
                        onClick={() => handlePostAttest(post._id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Attest Post
                      </button>
                    </>
                  ) : (
                    <div className="mb-2 text-yellow-500">
                      Your post is still pending approval.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
