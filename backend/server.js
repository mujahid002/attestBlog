const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");

const app = express();
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

app.post("/check-registration", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const registration = await collection.findOne({ userAddress });

    if (registration) {
      res
        .status(200)
        .json({ registered: true, approved: registration.approved });
    } else {
      res.status(200).json({ registered: false });
    }
  } catch (error) {
    console.error("Error checking registration status:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/user-register", async (req, res) => {
  const { username, bio, profilePicture, userAddress } = req.body;
  if (!username || !bio || !profilePicture || !userAddress) {
    return res.status(400).send("Invalid registration data!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const timestamp = new Date();
    const userRegistrationData = {
      userAddress,
      username,
      bio,
      profilePicture,
      timestamp: timestamp,
      approved: false,
    };

    await collection.insertOne(userRegistrationData);
    res.status(200).send("Registration data stored successfully!");
  } catch (error) {
    console.error("Error storing registration data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/get-registrations", async (req, res) => {
  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const registrations = await collection.find({}).toArray();
    res.status(200).json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/approve-registration", async (req, res) => {
  const { userAddress, approved } = req.body;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    await collection.updateOne({ userAddress }, { $set: { approved } });
    res.status(200).send({
      success: true,
      message: "User approval status updated successfully!",
    });
  } catch (error) {
    console.error("Error updating user approval status:", error);
    res.status(500).send("Internal server error");
  }
});

const port = process.env.PORT || 3001;
app.listen(port, async () => {
  //   await connectMongo();
  console.log(`Server listening on port: ${port}`);
});
