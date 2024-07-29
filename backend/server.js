const express = require("express");
const connectMongo = require("./database/connect-mongo");
const cors = require("cors");
const { ObjectId } = require("mongodb");

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  res.status(200).send("Working on 3001 PORT!");
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
      res.status(200).json({
        registered: true,
        approved: registration.approved,
        attested: registration.attestationId ? registration.attestationId : "",
      });
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

    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
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

    const timestamp = Math.floor(Date.now() / 1000);
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
    const postsCollection = db.collection("posts");
    const usersCollection = db.collection("userRegistrationApprovals");

    const posts = await postsCollection.find({}).toArray();

    // Fetch user details for each post
    const postsWithUserDetails = await Promise.all(
      posts.map(async (post) => {
        const user = await usersCollection.findOne({
          userAddress: post.author,
        });
        return {
          ...post,
          userDetails: {
            username: user.username,
            userAddress: user.userAddress,
            attestationId: user.attestationId,
          },
        };
      })
    );

    res.status(200).json(postsWithUserDetails);
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

app.post("/attest-post", async (req, res) => {
  const { userAddress, postId } = req.body;

  if (!userAddress || !postId) {
    return res.status(400).json({ success: false, message: "Invalid data!" });
  }

  try {
    // Here you would perform the actual attestation logic with the blockchain
    const attestationId = "mock-attestation-id"; // Replace with actual attestation logic

    const client = await connectMongo();
    const db = client.db("attest");
    const postsCollection = db.collection("posts");

    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { attested: true, attestationId } }
    );

    res.status(200).json({
      success: true,
      message: "Post attested successfully!",
      attestationId,
    });
  } catch (error) {
    console.error("Error attesting post:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/update-user-attestation", async (req, res) => {
  const { userAddress, attestationId } = req.body;
  if (!userAddress || !attestationId) {
    return res.status(400).send("Invalid data!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    await collection.updateOne({ userAddress }, { $set: { attestationId } });
    res.status(200).send({
      success: true,
      message: "User attestation ID updated successfully!",
    });
  } catch (error) {
    console.error("Error updating attestation ID:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/update-post-attestation", async (req, res) => {
  const { postId, attestationId } = req.body;

  if (!postId || !attestationId) {
    return res.status(400).json({ success: false, message: "Invalid data!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { attestationId } }
    );

    res.status(200).json({
      success: true,
      message: "Post attestation updated successfully!",
    });
  } catch (error) {
    console.error("Error updating post attestation:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/get-user-data-by-id", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user ID!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const userData = await collection.findOne({ _id: new ObjectId(userId) });

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/get-post-data", async (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid post ID!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    const postData = await collection.findOne({ _id: new ObjectId(postId) });

    if (!postData) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found!" });
    }

    res.status(200).json({ success: true, postData });
  } catch (error) {
    console.error("Error fetching post data:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/get-user-data", async (req, res) => {
  const { userAddress } = req.query;
  if (!userAddress) {
    return res.status(400).send("Invalid user address!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const userData = await collection.findOne({ userAddress });

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    res.status(200).json({ success: true, userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/get-user-posts", async (req, res) => {
  const { userAddress } = req.body;

  if (!userAddress) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid user address!" });
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const postsCollection = db.collection("posts");

    const posts = await postsCollection.find({ author: userAddress }).toArray();
    res.status(200).json({ success: true, posts: posts });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/react-to-user", async (req, res) => {
  const { attestationId, reactionAttestationId } = req.body;
  if (!reactionAttestationId || !attestationId) {
    return res.status(400).send("Invalid data!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("userRegistrationApprovals");

    const user = await collection.findOne({ attestationId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    await collection.updateOne(
      { attestationId },
      {
        $push: {
          reactions: reactionAttestationId,
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Reaction recorded successfully!" });
  } catch (error) {
    console.error("Error recording user reaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/react-to-post", async (req, res) => {
  const { attestationId, reactionAttestationId } = req.body;
  if (!attestationId || !reactionAttestationId) {
    return res.status(400).send("Invalid data!");
  }

  try {
    const client = await connectMongo();
    const db = client.db("attest");
    const collection = db.collection("posts");

    const post = await collection.findOne({ attestationId });

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found!" });
    }

    await collection.updateOne(
      { attestationId },
      {
        $push: {
          reactions: reactionAttestationId,
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Reaction recorded successfully!" });
  } catch (error) {
    console.error("Error recording post reaction:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, async () => {
  console.log(`Server listening on port: ${port}`);
});
