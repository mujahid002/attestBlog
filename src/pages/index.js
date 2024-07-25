import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";

export default function Home() {
  const { userAddress, setUserAddress, adminAddress } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAddressType = async () => {
      if (!userAddress) {
        console.log("User address not available yet.");
        return;
      }

      console.log("Admin address from context:", adminAddress);
      console.log("User address from context:", userAddress);

      try {
        if (userAddress.toLowerCase() === adminAddress.toLowerCase()) {
          console.log("User is an admin, redirecting to admin page.");
          router.push("/admin");
        } else {
          console.log("User is not an admin, checking registration status.");
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

          if (!response.ok) {
            throw new Error("Failed to fetch registration status");
          }

          const data = await response.json();

          if (data.registered) {
            console.log("User is registered, checking approval status.");
            setRegistrationStatus(data.approved ? "approved" : "pending");
            if (data.approved) {
              router.push("/dashboard");
            } else {
              router.push("/pending");
            }
          } else {
            console.log(
              "User is not registered, redirecting to register page."
            );
            setRegistrationStatus("not-registered");
            alert("You need to register first");
            router.push("/register");
          }
        }
      } catch (error) {
        console.error(
          "Error checking address type or registration status:",
          error
        );
        alert("An error occurred while checking registration status.");
      } finally {
        setLoading(false);
      }
    };

    if (userAddress) {
      setLoading(true);
      checkAddressType();
    } else {
      setLoading(false);
    }
  }, [userAddress, adminAddress, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl text-black font-bold mb-4">Home</h1>
        {!userAddress && <WalletConnect />}
        {loading && <div>Loading...</div>}
      </div>
    </div>
  );
}
