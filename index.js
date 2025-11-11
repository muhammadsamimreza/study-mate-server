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
    const requests = db.collection("requestsCollection");

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

    app.get("/partnerDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partners.findOne(query);
      console.log(result);
      res.send(result);
    });

    // Create a partner POST API
    app.post("/allpartners", async (req, res) => {
      const data = req.body;
      const result = await partners.insertOne(data);
      res.send(result);
    });

    // Create a PUT API for increment count Number

    app.put("/partners/:id/increment", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      const increment = { $inc: { partnerCount: 1 } };
      try {
        const result = await partners.updateOne(query, increment);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
    });

    // create API for Requst info Save
    app.post("/requests", async (req, res) => {
      const reqData = req.body;
      try {
        const existData = await requests.findOne({
          partnerId: reqData.partnerId,
          senderEmail: reqData.senderEmail,
        });
        if (existData) {
          return res
            .status(400)
            .send("You already sent a request to this partner!");
        }
        const result = await requests.insertOne(reqData);
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: error.message });
      }
    });

    // Create API for Get saved request data (Get)
    app.get("/requests", async (req, res) => {
      const { senderEmail } = req.query;
      try {
        const result = await requests.find({ senderEmail }).toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching requests" });
      }
    });

    // Delete API 
    app.delete("/requests/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) }
      try {
        const result = await requests.deleteOne(query);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error deleting request" });
      }
    });

    // Create API for Updated data
    app.put('/requests/:id', async(req,res)=>{
      const {id} = req.params
      const updatedData = req.body
      const query = {_id: new ObjectId(id)}
      const set = { $set: updatedData}
      try{
        const result = await requests.updateOne(query, set)
        res.send(result)
      }catch (err) {
        res.status(500).send({ message: "Error deleting request" });
      }
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

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
