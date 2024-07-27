import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import { useRouter } from "next/router";

export default function Register() {
  const { userAddress } = useGlobalContext();
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    profilePicture: "https://via.placeholder.com/150", // default image link
  });
  const [registrationStatus, setRegistrationStatus] = useState(null); // null, 'approved', 'pending', 'not-registered', 'attested'
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (userAddress) {
        try {
          const response = await fetch(
            "http://localhost:3001/check-registration",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ userAddress }),
            }
          );

          const data = await response.json();

          if (data.registered) {
            if (data.approved) {
              setRegistrationStatus(data.attested ? "attested" : "approved");
            } else {
              setRegistrationStatus("pending");
            }
          } else {
            setRegistrationStatus("not-registered");
          }
        } catch (error) {
          console.error("Error checking registration status:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
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
      const response = await fetch("http://localhost:3001/user-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, userAddress }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Registration successful");
        // Update the registration status after successful registration
        setRegistrationStatus("pending");
      } else {
        alert("Registration failed: " + data.message);
      }
    } catch (error) {
      console.error("There was an error with the registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const handleAttest = async () => {
    try {
      const response = await fetch("http://localhost:3001/attest-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userAddress }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Profile attested successfully");
        setRegistrationStatus("attested");
      } else {
        alert("Profile attestation failed: " + data.message);
      }
    } catch (error) {
      console.error("There was an error with the attestation:", error);
      alert("Profile attestation failed. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4">
          User Registration
        </h1>
        {!userAddress ? (
          <WalletConnect />
        ) : registrationStatus === "approved" ? (
          <>
            <p className="text-green-500">You are already approved!</p>
            <button
              onClick={handleAttest}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            >
              Attest Profile
            </button>
          </>
        ) : registrationStatus === "pending" ? (
          <p className="text-yellow-500">Your registration is still pending.</p>
        ) : registrationStatus === "attested" ? (
          <>
            <p className="text-green-500">Your profile is attested!</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-green-500">
              Connected Wallet: {userAddress}
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="profilePicture"
                >
                  Profile Picture (Default Used)
                </label>
                <input
                  type="text"
                  id="profilePicture"
                  name="profilePicture"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  disabled
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Register
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
