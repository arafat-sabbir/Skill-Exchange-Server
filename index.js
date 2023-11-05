const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));
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

    app.post("/api/user/accessToken", async (req, res) => {
      try {
        const user = req.body;
        const userinfo = req.user;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1hr",
        });
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
          })
          .send({ success: true }, userinfo);
      } catch (error) {
        console.log(error);
      }
    });
    

    app.get("/api/jobs", async (req, res) => {
      try {
        const userEmail = req.query?.email;
        const category = req.query?.category;
        const query = {};
        if (category) {
          query.category=category;
        }
        else if (userEmail) {
          query.email = userEmail;
        }
        const result = await JobsCollection.find(query).toArray();
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
