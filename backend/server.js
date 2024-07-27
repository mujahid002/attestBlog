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
    return res
      .status(400)
      .json({ success: false, message: "Invalid registration data!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const existingUser = await collection.findOne({ userAddress });

    if (existingUser) {
      if (existingUser.approved) {
        return res.status(200).json({
          success: false,
          message: "You are already registered and approved!",
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "You are already registered but still pending approval!",
        });
      }
    }

    const timestamp = new Date();
    const userRegistrationData = {
      userAddress,
      username,
      bio,
      profilePicture,
      timestamp: timestamp,
      approved: false,
      attestationId: null,
    };

    await collection.insertOne(userRegistrationData);
    res.status(200).json({
      success: true,
      message: "Registration data stored successfully!",
    });
  } catch (error) {
    console.error("Error storing registration data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

app.post("/disapprove-registration", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    await collection.deleteOne({ userAddress });
    res.status(200).send({
      success: true,
      message: "User registration disapproved and deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting user registration:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/check-post-status", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    const post = await collection.findOne({ author: userAddress });

    if (post) {
      res.status(200).json({ posted: true, approved: post.approved });
    } else {
      res.status(200).json({ posted: false });
    }
  } catch (error) {
    console.error("Error checking post status:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/create-post", async (req, res) => {
  const { theme, content, author } = req.body;

  if (!theme || !content || !author) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid post data!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    const existingPost = await collection.findOne({ author });

    if (existingPost) {
      if (existingPost.approved) {
        return res.status(200).json({
          success: false,
          message: "You already have an approved post!",
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "You already have a post pending approval!",
        });
      }
    }

    const timestamp = new Date();
    const postData = {
      theme,
      content,
      author,
      timestamp: timestamp,
      approved: false,
    };

    await collection.insertOne(postData);
    res.status(200).json({
      success: true,
      message: "Post created successfully!",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/get-posts", async (req, res) => {
  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    const posts = await collection.find({}).toArray();
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/approve-post", async (req, res) => {
  const { author, approved } = req.body;
  if (!author) {
    return res.status(400).send("Invalid author address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    await collection.updateOne({ author }, { $set: { approved } });
    res.status(200).send({
      success: true,
      message: "Post approval status updated successfully!",
    });
  } catch (error) {
    console.error("Error updating post approval status:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/disapprove-post", async (req, res) => {
  const { author } = req.body;
  if (!author) {
    return res.status(400).send("Invalid author address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    await collection.deleteOne({ author });
    res.status(200).send({
      success: true,
      message: "Post disapproved and deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/attest-profile", async (req, res) => {
  const { userAddress } = req.body;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    // Call EAS API to attest the profile and get the attestation ID
    const attestationId = "fake-attestation-id"; // Replace with actual attestation logic

    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    await collection.updateOne({ userAddress }, { $set: { attestationId } });

    res
      .status(200)
      .json({ success: true, message: "Profile attested successfully!" });
  } catch (error) {
    console.error("Error attesting profile:", error);
    res.status(500).send("Internal server error");
  }
});
const port = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);
});
