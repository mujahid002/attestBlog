const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const app = express();
const {
  storeBlogAttest,
  storePost,
  fetchPostData,
  fetchBlogAttest,
  fetchUserBlogAttest,
} = require("./database/index");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.status(200).send("Working on 7001 PORT!");
});
app.get("/fetch-blog-attests", async (req, res) => {
  try {
    const blogAttests = await fetchBlogAttest();
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
    const { attestData } = req.body;
    if (!attestData) {
      return res.status(400).send("Invalid attest data!");
    }
    await storeBlogAttest(attestData);
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

const port = process.env.PORT || 7001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);

  // connectMongo();
});
