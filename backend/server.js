const express = require("express");
const connectMongo = require("./database/connect-mongo");
const { ObjectId } = require("mongodb");
const { resolverContract } = require("./constants/index");

const cors = require("cors");

const app = express();
const {
  storeUserAttest,
  storePost,
  updatePostData,
  fetchUserPostData,
  fetchPostData,
  fetchAttestData,
  fetchUserBlogAttest,
} = require("./database/index");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.status(200).send("Working on 7001 PORT!");
});
app.get("/fetch-attests", async (req, res) => {
  try {
    const blogAttests = await fetchAttestData();
    if (!blogAttests) {
      return res.status(404).send("No attest data found");
    }
    return res.status(200).json(blogAttests);
  } catch (error) {
    console.error("Error fetching blog attests:", error);
    return res.status(500).send("Internal server error");
  }
});
app.get("/fetch-user-attests/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.params;

    // Check if userAddress is not provided or empty
    if (!userAddress || userAddress.trim() === "") {
      return res.status(400).send("Invalid user address!");
    }

    const blogAttests = await fetchUserBlogAttest(userAddress.toString());
    if (!blogAttests || blogAttests.length === 0) {
      return res.status(404).send("No attest data found for the user");
    }
    return res.status(200).json(blogAttests);
  } catch (error) {
    console.error("Error fetching user blog attests:", error);
    return res.status(500).send("Internal server error");
  }
});

app.post("/store-attest", async (req, res) => {
  try {
    const { attestedData } = req.body;
    if (!attestedData) {
      return res.status(400).send("Invalid attest data!");
    }
    await storeUserAttest(attestedData);
    return res.status(200).send("Attested data stored successfully!");
  } catch (error) {
    console.error("Error storing attest data:", error);
    return res.status(500).send("Internal server error");
  }
});
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
app.post("/update-post-data", async (req, res) => {
  try {
    const { updateData } = req.body;

    const _id = updateData.id;

    if (_id && typeof _id === "string" && ObjectId.isValid(_id)) {
      const objectId = new ObjectId(_id);
      await updatePostData(objectId, updateData);
      if (updateData.check === true) {
        const giveAccess = await resolverContract.updateAccessForAttester(
          updateData.Owner,
          true
        );
      }
      return res.status(200).send("Post data stored successfully!");
    } else {
      // If _id is missing or invalid, return a 400 Bad Request response
      return res.status(400).send("Invalid _id provided");
    }
  } catch (error) {
    console.error("Error storing post data:", error);
    return res.status(500).send("Internal server error");
  }
});

app.get("/fetch-post-data", async (req, res) => {
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
app.get("/fetch-post-data/:userAddress", async (req, res) => {
  try {
    const { userAddress } = req.query;
    const postData = await fetchUserPostData(userAddress);
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
