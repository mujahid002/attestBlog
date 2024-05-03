const connectMongo = require("./connect-mongo");

const storeUserAttest = async (attestData) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("attest");
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
const updatePostData = async (id, updateData) => {
  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("admin");

    // Update the document with the provided id
    await collection.updateOne(
      { _id: id },
      {
        $set: {
          "postData.canPost": updateData.check,
        },
        $addToSet: {
          "postData.reason": updateData.reason,
        },
      }
    );

    await client.close();
  } catch (error) {
    console.error("Error updating post data:", error);
    // You might want to handle errors differently based on your requirements
    throw error; // Re-throw the error to propagate it upwards
  }
};

const fetchAttestData = async () => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("attest");

  const blogAttests = await collection.find({}).toArray();

  console.log(blogAttests);

  return blogAttests;
};
const fetchUserPostData = async (address) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("admin");

  const postData = await collection
    .find({ "postData.Owner": address })
    .toArray();

  console.log(postData);

  // await client.close();

  return postData;
};

const fetchPostData = async () => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("admin");

  const postData = await collection.find({}).toArray();

  console.log(postData);

  // await client.close();

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

    // await client.close();

    return blogAttests;
  } catch (error) {
    console.error("Error fetching user blog attests:", error);
    throw error;
  }
};

module.exports = {
  storeUserAttest,
  storePost,
  fetchUserPostData,
  updatePostData,
  fetchPostData,
  fetchAttestData,
  fetchUserBlogAttest,
};
