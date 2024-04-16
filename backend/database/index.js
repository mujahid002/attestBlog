const connectMongo = require("./connect-mongo");

const storeBlogAttest = async (attestData) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("blog");
  await collection.insertOne({ attestData });
  await client.close();
};

const fetchBlogAttest = async () => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("blog");

  const blogAttests = await collection.find({}).toArray();

  console.log(blogAttests);

  await client.close();

  return blogAttests;
};
const fetchUserBlogAttest = async (userAddress) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("blog");

  try {
    // Filter documents where "attestData.owner" matches the userAddress
    // const query = { "attestData.owner": userAddress };
    const query = {
      $or: [
        { "attestData.owner": userAddress },
        { attestData: { $exists: true } },
      ],
    };

    const blogAttests = await collection.find(query).toArray();
    console.log(userAddress);
    console.log(blogAttests);

    await client.close();

    return blogAttests;
  } catch (error) {
    console.error("Error fetching user blog attests:", error);
    throw error;
  }
};

module.exports = { storeBlogAttest, fetchBlogAttest, fetchUserBlogAttest };
