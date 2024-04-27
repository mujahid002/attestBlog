export async function fetchScore(address, scorerId) {
  const getScoreConfig = {
    headers: {
      "X-API-KEY": process.env.NEXT_PUBLIC_SCORER_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const { data } = await axios.get(
    `https://api.scorer.gitcoin.co/registry/score/${scorerId}/${address}`,
    getScoreConfig
  );

  // Again the returned data will look like this.
  // {
  //  "address": "{address}",
  //  "score": "1.5272",
  //  "status": "DONE",
  //  "last_score_timestamp": "2023-02-03T12:08:21.735838+00:00",
  //  "evidence": null,
  //  "error": null
  // }

  // However, this time the status should be "DONE" and the score should be present.
  // If the status is still "PROCESSING" the frontend should sleep for a few seconds
  // and retry the request.

  return data;
}
