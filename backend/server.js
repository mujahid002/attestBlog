const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const app = express();
const { storeBlogAttest, fetchBlogAttest } = require("./database/index");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/fetch-blog-attests", fetchBlogAttest);
app.post("/store-attest", storeBlogAttest);

const port = process.env.PORT || 7001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);

  connectMongo();
});
