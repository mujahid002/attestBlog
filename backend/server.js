const express = require("express");
const ethers = require("ethers");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/fetch-knowledge-prices", fetchPrice);
// app.get("/fetch-knowledge-prices", fetchPrice);
// app.post("/raise-proposal", storeRaisedProposal);
// app.get("/fetch-proposals", fetchProposalsForProposalIds);

const port = process.env.PORT || 7001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);

  connectMongo();
});
