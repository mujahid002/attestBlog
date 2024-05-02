const connectMongo = require("./connect-mongo");

const storeBlogAttest = async (attestData) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("post");
  await collection.insertOne({ attestData });
  await client.close();
};
const storePost = async (postData) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("admin");
  await collection.insertOne({ postData });
  await client.close();
};

const fetchBlogAttest = async () => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("post");

  const blogAttests = await collection.find({}).toArray();

  console.log(blogAttests);

  await client.close();

  return blogAttests;
};
const fetchPostData = async () => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("admin");

  const postData = await collection.find({}).toArray();

  console.log(postData);

  await client.close();

  return postData;
};
const fetchUserBlogAttest = async (userAddress) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("post");

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

module.exports = {
  storeBlogAttest,
  storePost,
  fetchPostData,
  fetchBlogAttest,
  fetchUserBlogAttest,
};
