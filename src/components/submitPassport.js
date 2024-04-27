import axios from "axios";

export const submitPassport = async (address, scorerId) => {
  const submitPassportConfig = {
    headers: {
      "X-API-KEY": process.env.NEXT_PUBLIC_SCORER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  // This is the body that will be sent to the Passport API for scoring
  const submitPassportData = {
    address: address,
    scorer_id: scorerId,
  };

  try {
    const { data } = await axios.post(
      "https://api.scorer.gitcoin.co/registry/submit-passport",
      submitPassportData,
      submitPassportConfig
    );
    return data;
  } catch (error) {
    // Check if the error is due to an incorrect scorer ID
    if (error.response && error.response.status === 400) {
      alert(`Incorrect scorer ID provided your ID = ${scorerId}`);
    } else {
      // For other errors, re-throw the original error
      throw error;
    }
  }
};
