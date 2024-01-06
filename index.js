const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "https://rococo-queijadas-4a8d5c.netlify.app",
      "https://skill-exchange-port.web.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t245pno.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access Detected" });
  }
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Invalid Access Detected" });
      }
      req.user = decoded;
      next();
    });
  }
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const JobsCollection = client.db("Jobs").collection("jobs");
    const BidCollection = client.db("Jobs").collection("bids");
    const ReviewCollection = client.db("Jobs").collection("review");
    const bookmarkCollection = client.db("Jobs").collection("bookmark");
    // Make A Token For Signed In User
    app.post("/api/user/accessToken", async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1hr",
        });
        res
          .cookie("token", token, {
            sameSite: "none",
            secure: true,
            httpOnly: true,
          })
          .send({ token });
      } catch (error) {
        res.status(401).send(error);
      }
    });
    // Clear the cookie if user is not logged in
    app.post("/api/user/signOut", async (req, res) => {
      const user = req.body;
      console.log("signOut user", user);
      res.clearCookie("token", { maxAge: 0 }).send({ clearsuccess: true });
    });
    // Get Job For My Posted Jobs
    app.get("/api/jobs", verifyToken, async (req, res) => {
      try {
        if (req.user.email !== req.query.email) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        let query = {};
        if (req.query?.email) {
          query = { sellerEmail: req.query.email };
        }
        const result = await JobsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // Get My bids By bidderEmail
    app.get("/api/getMyBid", verifyToken, async (req, res) => {
      try {
        const sortValue = req.query.sortvalue;
        if (req.user.email !== req.query.bidderEmail) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        let query = {};
        let sort = {};
        sort["biddingStatus"] = sortValue;
        if (req.query?.bidderEmail) {
          query = { bidderEmail: req.query.bidderEmail };
        }
        const result = await BidCollection.find(query).sort(sort).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // Get review Based On Post Id
    app.get("/api/review/:id", async (req, res) => {
      const query = { postid: req.params.id };
      const result = await ReviewCollection.find(query).toArray();
      res.send(result);
    });
    // Add Review On Post
    app.post("/api/addReview", async (req, res) => {
      const reviewData = req.body;
      console.log(reviewData);
      const result = await ReviewCollection.insertOne(reviewData);
      res.send(result);
    });
    // Get the bookmarked Post For User
    app.get("/api/bookmarks", async (req, res) => {
      const email = req.query.email;
      const query = { bookmarkUser: email };
      const result = await bookmarkCollection.find(query).toArray();
      res.send(result);
    });

    // Delete A bookmarked Post
    app.delete('/api/deleteBookmark/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookmarkCollection.deleteOne(query);
      res.send(result);
    })
    app.post("/api/addtobookmark", async (req, res) => {
      const bookmarkData = req.body;
      console.log(bookmarkData);
      const result = await bookmarkCollection.insertOne(bookmarkData);
      res.send(result);
    });

    app.get("/api/getbidreq", verifyToken, async (req, res) => {
      try {
        if (req.user.email !== req.query.sellerEmail) {
          return res.status(403).send({ message: "Forbidden Access" });
        }
        let query = {};
        if (req.query?.bidded) {
          query = {
            bidded: req.query.bidded,
            sellerEmail: req.query.sellerEmail,
          };
        }
        const result = await BidCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/api/jobsBy-category", async (req, res) => {
      try {
        const query = { category: req.query?.category };

        const result = await JobsCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/api/bidJobs/:id", async (req, res) => {
      try {
        const id = req.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await JobsCollection.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Add Job in the Job Collection
    app.post("/api/add-jobs", async (req, res) => {
      try {
        const job = req.body;
        const result = await JobsCollection.insertOne(job);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.post("/api/add-bids", async (req, res) => {
      try {
        const job = req.body;
        const result = await BidCollection.insertOne(job);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.patch("/api/update-job/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const jobifo = req.body;
        const query = { _id: new ObjectId(id) };
        const updatejob = {
          $set: {
            sellerEmail: jobifo.sellerEmail,
            jobtitle: jobifo.jobtitle,
            minPrice: jobifo.minPrice,
            maxPrice: jobifo.maxPrice,
            description: jobifo.description,
            category: jobifo.category,
            deadline: jobifo.deadline,
          },
        };
        const result = await JobsCollection.updateOne(query, updatejob);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/api/update-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const jobifo = req.body;
        const query = { _id: new ObjectId(id) };
        const updatestatus = {
          $set: {
            biddingStatus: jobifo.status,
          },
        };
        const result = await BidCollection.updateOne(query, updatestatus);
        res.send({ result });
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/api/reject-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const jobifo = req.body;
        const query = { _id: new ObjectId(id) };
        const updatestatus = {
          $set: {
            biddingStatus: jobifo.status,
          },
        };
        const result = await BidCollection.updateOne(query, updatestatus);
        res.send({ result });
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/api/complete-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const jobifo = req.body;
        const query = { _id: new ObjectId(id) };
        const updatestatus = {
          $set: {
            biddingStatus: jobifo.status,
          },
        };
        const result = await BidCollection.updateOne(query, updatestatus);
        res.send({ result });
      } catch (error) {
        console.log(error);
      }
    });
    app.delete("/api/delete-jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await JobsCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Skill Exchange Is running");
});

app.listen(port, () => {
  console.log(`SKILL EXCHANGE is running on port: ${port}`);
});
