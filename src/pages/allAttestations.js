import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/Store";
import WalletConnect from "../components/walletConnection";
import {
  EAS as EAS150,
  SchemaDecoder,
} from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";
import {
  easContractAddress,
  userSchemaUID,
  postSchemaUID,
  reactionSchemaUID,
} from "@/constants/index";

export default function AllAttestations() {
  const { userAddress } = useGlobalContext();
  const [userAttestations, setUserAttestations] = useState([]);
  const [postAttestations, setPostAttestations] = useState([]);
  const [reactionAttestations, setReactionAttestations] = useState([]);
  const [decodedPostData, setDecodedPostData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAttestations = async () => {
    try {
      if (!window.ethereum) {
        alert("No Provider");
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      const eas = new EAS150(easContractAddress);
      eas.connect(provider);
      const query = `
      query {
        userAttestations: schema(where: { id: "${userSchemaUID}" }) {
          attestations {
            id
          }
        }
        postAttestations: schema(where: { id: "${postSchemaUID}" }) {
          attestations {
            id
          }
        }
        reactionAttestations: schema(where: { id: "${reactionSchemaUID}" }) {
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

      const userAttestationIds = result.data.userAttestations.attestations.map(
        (a) => a.id
      );
      const postAttestationIds = result.data.postAttestations.attestations.map(
        (a) => a.id
      );
      const reactionAttestationIds =
        result.data.reactionAttestations.attestations.map((a) => a.id);

      const fetchDetails = async (ids) => {
        const details = [];
        for (const id of ids) {
          try {
            const attestation = await eas.getAttestation(id);
            details.push(attestation);
          } catch (error) {
            console.error(`Error fetching attestation with id ${id}:`, error);
          }
        }
        return details;
      };

      const userAttestationDetails = await fetchDetails(userAttestationIds);
      const postAttestationDetails = await fetchDetails(postAttestationIds);
      const reactionAttestationDetails = await fetchDetails(
        reactionAttestationIds
      );

      setUserAttestations(userAttestationDetails);
      setPostAttestations(postAttestationDetails);
      setReactionAttestations(reactionAttestationDetails);

      // Decode the post attestation data
      const schemaString =
        "string theme, string content, string author, uint256 timestamp, bool approved";

      const decodedDataPromises = postAttestationDetails.map(
        async (attestation) => {
          const schemaDecoder = new SchemaEncoder(schemaString); // Corrected usage if SchemaEncoder is used for decoding as well
          const decoded = schemaDecoder.decodeData(attestation.data);
          return { id: attestation.id, decoded };
        }
      );

      const decodedDataArray = await Promise.all(decodedDataPromises);
      const decodedDataObject = decodedDataArray.reduce(
        (acc, { id, decoded }) => {
          acc[id] = decoded;
          return acc;
        },
        {}
      );

      setDecodedPostData(decodedDataObject);
    } catch (error) {
      console.error("Error fetching attestations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttestations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderUserAttestation = (attestation) => (
    <div key={attestation.id} className="bg-gray-200 p-4 rounded-lg">
      <div className="mb-2 text-black">
        <strong>ID:</strong> {attestation.uid.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Attester:</strong> {attestation.attester.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Ref UID:</strong> {attestation.refUID.slice(0, 4)}
      </div>
      <div className="mb-2 text-black">
        <strong>Revocable:</strong> {attestation.revocable ? "Yes" : "No"}
      </div>
      <div className="mb-2 text-black">
        <strong>Time:</strong>{" "}
        {new Date(Number(attestation.time) * 1000).toLocaleString()}
      </div>
    </div>
  );

  const renderPostAttestation = (attestation) => (
    <div key={attestation.id} className="bg-gray-200 p-4 rounded-lg">
      <div className="mb-2 text-black">
        <strong>ID:</strong> {attestation.uid.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Attester:</strong> {attestation.attester.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Ref UID:</strong> {attestation.refUID.slice(0, 4)}
      </div>
      <div className="mb-2 text-black">
        <strong>Revocable:</strong> {attestation.revocable ? "Yes" : "No"}
      </div>
      <div className="mb-2 text-black">
        <strong>Time:</strong>{" "}
        {new Date(Number(attestation.time) * 1000).toLocaleString()}
      </div>
      {/* <div className="mb-2 text-black">
        <strong>Data:</strong>{" "}
        {JSON.stringify(decodedPostData[attestation.id], null, 2)}
      </div> */}
    </div>
  );

  const renderReactionAttestation = (attestation) => (
    <div key={attestation.id} className="bg-gray-200 p-4 rounded-lg">
      <div className="mb-2 text-black">
        <strong>ID:</strong> {attestation.uid.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Attester:</strong> {attestation.attester.slice(0, 6) + "...."}
      </div>
      <div className="mb-2 text-black">
        <strong>Ref UID:</strong> {attestation.refUID.slice(0, 4)}
      </div>
      <div className="mb-2 text-black">
        <strong>Revocable:</strong> {attestation.revocable ? "Yes" : "No"}
      </div>
      <div className="mb-2 text-black">
        <strong>Time:</strong>{" "}
        {new Date(Number(attestation.time) * 1000).toLocaleString()}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {!userAddress && <WalletConnect />}
      <div className="w-full max-w-7xl bg-white p-6 rounded-lg shadow-md flex flex-col space-y-4 overflow-x-auto">
        <div className="w-full p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">
            User Attestations
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {userAttestations.map(renderUserAttestation)}
          </div>
        </div>
        <div className="w-full p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">
            Post Attestations
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {postAttestations.map(renderPostAttestation)}
          </div>
        </div>
        <div className="w-full p-4 rounded-lg shadow-lg overflow-y-auto h-96">
          <h2 className="text-xl text-black font-bold mb-4">
            Reaction Attestations
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {reactionAttestations.map(renderReactionAttestation)}
          </div>
        </div>
      </div>
    </div>
  );
}
