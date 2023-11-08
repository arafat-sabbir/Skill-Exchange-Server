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
    origin: ["http://localhost:5173", "https://skill-exchange-1c418.web.app"],
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

// const verifyToken = (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(401).send({ message: "Unauthorized Access Detected" });
//   }
//   if (token) {
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//       if (err) {
//         return res
//           .status(401)
//           .send({ message: "Unauthorized Session Detected" });
//       }
//       req.user = jwt.decoded;
//       next();
//     });
//   }
// };

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const JobsCollection = client.db("Jobs").collection("jobs");
    const BidCollection = client.db("Jobs").collection("bids");

    // app.post("/api/user/accessToken", async (req, res) => {
    //   try {
    //     const user = req.body;
    //     // const userinfo = req.user;
    //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    //       expiresIn: "1hr",
    //     });
    //     res
    //       .cookie("token", token, {
    //         httpOnly: true,
    //         secure: true,
    //         sameSite: "none",
    //       })
    //       .send({ success: true }, userinfo);
    //   } catch (error) {
    //     res.send(error);
    //   }
    // });

    app.get("/api/jobs", async (req, res) => {
      try {
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
    app.get("/api/getMyBid", async (req, res) => {
      try {
        let query = {};
        if (req.query?.bidderEmail) {
          query = { bidderEmail: req.query.bidderEmail };
        }
        const result = await BidCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/api/getbidreq", async (req, res) => {
      try {
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
    await client.db("admin").command({ ping: 1 });
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
