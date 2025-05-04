const express = require("express");
const cors = require("cors");
const app = express();
// index.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongo uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w0hnc79.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const coffeeCollection = client.db("coffeeDB").collection("coffees");

    //   rest api

    //   read the data into server
    app.get("/coffees", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //   read a single data
    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    //   post the data into database
    app.post("/coffees", async (req, res) => {
      const coffees = req.body;
      console.log(coffees);
      const result = await coffeeCollection.insertOne(coffees);
      res.send(result);
    });

    //   put/patch the data into db
    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      console.log(id, coffee);

      // filter
      const filter = { _id: new ObjectId(id) };

      //  Set the upsert option to insert a document if no documents match
      // the filter
      const options = { upsert: true };

      // Specify the update to set a value for the plot field
      const updateCoffee = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          supplier: coffee.supplier,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photo: coffee.photo,
        },
      };

      const result = await coffeeCollection.updateOne(
        filter,
        updateCoffee,
        options
      );
      res.send(result);
    });

    //   delete a data from both
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;

      // query
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // end of coffees

    // * //
    //-----------------//
    // *  //
    // users connect
    const usersCollection = client.db("usersDB").collection("users");

    // from now on it will be for users api

    // read api
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // create api
    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersCollection.insertOne(users);
      res.send(result);
    });

    // update api patch
    app.patch("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      console.log(email, user);

      // filter
      const filter = { email: email };

      //  Set the upsert option to insert a document if no documents match
      // the filter
      const options = { upsert: false };

      // Specify the update to set a value for the plot field
      const updateUser = {
        $set: {
          accountCreated: user.accountCreated,
          lastSignIn: user.lastSignIn,
        },
      };

      const result = await usersCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });

    // delete
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);

      // query
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // * //
    //-----------------//
    // *  //

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
  res.send("the server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
