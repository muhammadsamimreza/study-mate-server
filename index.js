const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqrplnr.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("study-Partners");
    const partners = db.collection("partnersCollection");

    // all Partners get API
    app.get("/allpartners", async (req, res) => {
      const result = await partners.find().toArray();
      console.log(result);

      res.send(result);
    });

    // Top Ratted Partner get API

    app.get("/top-partners", async (req, res) => {
      try {
        const result = await partners
          .find()
          .sort({ rating: -1 })
          .limit(3)
          .toArray();
        // console.log(result);
        res.send(result);
      } catch (err) {
        console.error("Error fetching top partners:", err);
        res.status(500).send({ message: "Error fetching top partners" });
      }
    });


    // get One Partner 

    app.get('/partnerDetails/:id', async(req, res)=>{
            const id = req.params.id
            const query = { _id: new ObjectId(id)}
            const result = await partners.findOne(query)
            console.log(result)
            res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
