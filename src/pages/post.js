import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";

export default function Post() {
  const { userAddress, setUserAddress, adminAddress } = useGlobalContext();
  const [loading, setLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAddressType = async () => {
      if (userAddress) {
        if (userAddress === adminAddress) {
          // Navigate to admin page if address matches admin address
          router.push("/admin");
        } else {
          // Check user registration status if not an admin
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
            setRegistrationStatus(data.approved ? "approved" : "pending");
            router.push("/register");
          } else {
            setRegistrationStatus("not-registered");
            // Handle not registered user scenario
            alert("You need to register first");
          }
        }

        setLoading(false);
      }
    };

    checkAddressType();
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
