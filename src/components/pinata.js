export const handleUploadToPinata = async (fileName, data) => {
  try {
    if (!data) {
      throw new Error("Invalid Data!");
    }

    const blobData = new Blob([data], { type: "application/json" });

    const form = new FormData();
    form.append("file", blobData, "data.json");

    const metadata = JSON.stringify({
      name: fileName,
    });
    form.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 0,
    });
    form.append("pinataOptions", options);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: form,
    });

    if (!res.ok) {
      throw new Error(`Failed to upload file to Pinata: ${res.statusText}`);
    }

    const resData = await res.json();

    console.log("the response is: ", resData.IpfsHash);

    return resData.IpfsHash;
  } catch (error) {
    console.error(error);
    throw new Error("Unable to upload file to Pinata");
  }
};
