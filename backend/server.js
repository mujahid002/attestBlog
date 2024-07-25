const express = require("express");
const connectMongo = require("./database/connect-mongo");
const { ObjectId } = require("mongodb");
const { resolverContract } = require("./constants/index");
const ethers = require("ethers");
const cors = require("cors");

const app = express();
const { storePost, fetchPostData } = require("./database/index");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.status(200).send("Working on 7001 PORT!");
});

const registerUser = async (userData) => {
  const client = await connectMongo();
  const db = client.db("attest");
  const collection = db.collection("userRegistrationApprovals");
  await collection.insertOne({
    ...userData,
    registeredTimestamp: new Date(),
    approved: false,
  });
  await client.close();
};
async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { username, bio, profilePicture, userAddress } = req.body;
      if (!username || !bio || !profilePicture || !userAddress) {
        return res.status(400).send("Invalid user data!");
      }

      await registerUser({ username, bio, profilePicture, userAddress });
      return res.status(200).send("User registered successfully!");
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).send("Internal server error");
    }
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}

app.post("/store-post", async (req, res) => {
  try {
    const { postData } = req.body;
    if (!postData) {
      return res.status(400).send("Invalid post data!");
    }
    await storePost(postData);
    return res.status(200).send("Post data stored successfully!");
  } catch (error) {
    console.error("Error storing post data:", error);
    return res.status(500).send("Internal server error");
  }
});

app.get("/fetch-posts", async (req, res) => {
  try {
    const postData = await fetchPostData();
    if (!postData) {
      return res.status(404).send("No attest data found");
    }
    return res.status(200).json(postData);
  } catch (error) {
    console.error("Error fetching blog attests:", error);
    return res.status(500).send("Internal server error");
  }
});

const port = process.env.PORT || 7001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);

  // connectMongo();
});
