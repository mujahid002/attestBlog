import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/WalletConnect";
import { useRouter } from "next/router";

export default function Admin() {
  const { userAddress, adminAddress, setUserAddress } = useGlobalContext();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      if (!userAddress) {
        // Redirect to home if wallet is not connected
        router.push("/");
      } else if (userAddress === adminAddress) {
        fetchRegistrations();
      } else {
        // Redirect to home if not admin
        router.push("/");
      }
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

  const handleApprove = async (userAddress) => {
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
    }
  };

  const handleDisapprove = async (userAddress) => {
    const response = await fetch("http://localhost:3001/approve-registration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress, approved: false }),
    });

    const data = await response.json();
    if (data.success) {
      alert("User disapproved successfully");
      fetchRegistrations();
    } else {
      alert("Failed to disapprove user: " + data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4">Admin Dashboard</h1>
        {!userAddress ? (
          <WalletConnect />
        ) : userAddress === adminAddress ? (
          <>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <ul>
                {registrations.map((reg) => (
                  <li key={reg.userAddress} className="mb-4">
                    <div className="mb-2">
                      <strong>Username:</strong> {reg.username}
                    </div>
                    <div className="mb-2">
                      <strong>Bio:</strong> {reg.bio}
                    </div>
                    <div className="mb-2">
                      <strong>Profile Picture:</strong>{" "}
                      <img src={reg.profilePicture} alt="Profile" width={50} />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleApprove(reg.userAddress)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDisapprove(reg.userAddress)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Disapprove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-red-500">Unauthorized access</p>
        )}
      </div>
    </div>
  );
}
