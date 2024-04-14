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

  const blogAttents = await collection.find({}).toArray();

  await client.close();

  return blogAttents;
};

module.exports = { storeBlogAttest, fetchBlogAttest };
