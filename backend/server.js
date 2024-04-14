const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const app = express();
const { storeBlogAttest, fetchBlogAttest } = require("./database/index");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/fetch-blog-attests", async (req, res) => {
  try {
    const blogAttents = await fetchBlogAttest();
    if (!blogAttents) {
      return res.status(404).send("No attest data found");
    }
    return res.status(200).json(blogAttents);
  } catch (error) {
    console.error("Error fetching blog attests:", error);
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

const port = process.env.PORT || 7001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);

  connectMongo();
});
