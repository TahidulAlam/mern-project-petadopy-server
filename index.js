// tahidcse
// Z730isvK91QgQgG0
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    const petadopyDB = client.db("petadopyDB");
    const usersCollection = petadopyDB.collection("usersCollection");
    const adoptCollection = petadopyDB.collection("adoptCollection");
    const petlists = petadopyDB.collection("petlists");
    const doanationCamp = petadopyDB.collection("doanationCamp");
    const donatesCollection = petadopyDB.collection("donatesCollection");
    const petcategories = petadopyDB.collection("petcategories");

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: " forbidden access" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          return res.status(401).send({ message: " forbidden access" });
        }
        req.decoded = decoded;
        next();
      });
    };
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded?.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };
    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });
        res.send({ token });
      } catch (error) {
        console.log(error);
      }
    });
    app.post("/api/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const isExist = await usersCollection.findOne(query);
        if (isExist) {
          return res.send({ message: "user already exists", insertedId: null });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    //all user
    app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    //user rule cheak
    app.get("/api/users/:email", verifyToken, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "unauthorised access" });
      }
      const query = { email: email };
      const user = await usersCollection.findOne(query);

      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });
    //user rule set
    app.patch(
      "/api/users/admin/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updateDoc = {
            $set: {
              role: "admin",
            },
          };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );
    //user delete
    app.delete("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await usersCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // all pets list for all user
    app.get("/api/category", async (req, res) => {
      try {
        const result = await petcategories.find().toArray();
        console.log(result);
        res.json({
          result,
          success: true,
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }
    });
    app.get("/api/allPets", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { page = 1, pageSize = 12 } = req.query;
        const result = await petlists
          .find({})
          .skip((page - 1) * pageSize)
          .limit(Number(pageSize))
          .toArray();
        const totalPets = await petlists.countDocuments({});
        const totalPages = Math.ceil(totalPets / pageSize);
        res.json({
          result,
          totalPages,
          success: true,
        });
      } catch (error) {
        console.log(error);
        res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }
    });
    // pets delete for admin
    app.delete(
      "/api/allPets/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await petlists.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );
    //pets update for user and admin
    app.patch("/api/allPets/:id", verifyToken, async (req, res) => {
      try {
        const item = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            name: item.name,
            age: item.age,
            image: item.image,
            category: item.category,
            location: item.location,
            longDescription: item.longDescription,
            shortDescription: item.shortDescription,
          },
        };
        const result = await petlists.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // all donations for
    app.get("/api/allDonations", verifyToken, verifyAdmin, async (req, res) => {
      try {
        const { page = 1, pageSize = 12 } = req.query;
        const skip = (page - 1) * pageSize;
        const result = await doanationCamp
          .find({})
          .skip(skip)
          .limit(Number(pageSize))
          .toArray();
        const total = await doanationCamp.countDocuments({});
        const totalPages = Math.ceil(total / pageSize);
        res.send({
          totalPages,
          result,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.delete(
      "/api/allDonations/:id",
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        try {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await doanationCamp.deleteOne(query);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );
    // user
    app.post("/api/adopt", verifyToken, async (req, res) => {
      try {
        const data = req.body;
        const result = await adoptCollection.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/api/adopt", verifyToken, async (req, res) => {
      try {
        const query = { email: req.query.email };
        // console.log(query);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;
        const cursor = await adoptCollection
          .find(query)
          .skip(skip)
          .limit(limit);
        const result = await cursor.toArray();
        const total = await adoptCollection.countDocuments(query);
        res.send({
          total,
          result,
        });
      } catch (error) {
        console.log(error);
      }
    });
    app.delete("/api/adopt/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await adoptCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // app.patch("/api/adopt/:id", async (req, res) => {
    //   try {
    //     // const defaultData = req.body;
    //     const id = req.params.id;
    //     console.log(id);
    //     // const filter = { _id: new ObjectId(id) };
    //     const filterNew = { _id: id };
    //     console.log(filterNew);
    //     const updatedDoc = {
    //       $set: {
    //         adopted: true,
    //       },
    //     };
    //     console.log(updatedDoc);
    //     const result = await petlists.updateOne(filterNew, updatedDoc);
    //     console.log(result);
    //     res.send(result);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // });
    // app.patch("/api/adopt/:id", async (req, res) => {
    //   try {
    //     const id = req.params.id;
    //     console.log("Received id:", id);
    //     const filter = { _id: id };
    //     console.log(filter);
    //     const updatedDoc = {
    //       $set: {
    //         adopted: true,
    //       },
    //     };
    //     const result = await petlists.updateOne(filter, updatedDoc);
    //     console.log(result);
    //     res.send(result);
    //     // if (result.modifiedCount === 1) {
    //     //   res.send({ success: true, message: "Document updated successfully" });
    //     // } else {
    //     //   res
    //     //     .status(500)
    //     //     .send({ success: false, message: "Failed to update document" });
    //     // }
    //   } catch (error) {
    //     console.log(error);
    //     res
    //       .status(500)
    //       .send({ success: false, message: "Internal server error" });
    //   }
    // });
    // app.patch("/api/adopt/:petIds", verifyToken, async (req, res) => {
    //   try {
    //     const id = req.params.petIds;
    //     console.log("Received id:", id);
    //     const filter = { _id: id };
    //     console.log("Filter:", filter);
    //     const updatedDoc = {
    //       $set: {
    //         adopted: true,
    //       },
    //     };

    //     const result = await petlists.updateOne(filter, updatedDoc);
    //     console.log("Update Result:", result);

    //     if (result.modifiedCount === 1) {
    //       res.send({ success: true, message: "Document updated successfully" });
    //     } else {
    //       res
    //         .status(500)
    //         .send({ success: false, message: "Failed to update document" });
    //     }
    //   } catch (error) {
    //     console.log(error);
    //     res
    //       .status(500)
    //       .send({ success: false, message: "Internal server error" });
    //   }
    // });
    app.patch("/api/adopt/:petIds", verifyToken, async (req, res) => {
      try {
        const id = req.params.petIds;
        console.log("Received id:", id);

        const objectId = new ObjectId(id);
        const filter = { _id: objectId };
        console.log("Filter:", filter);

        const updatedDoc = {
          $set: {
            adopted: true,
          },
        };

        const result = await petlists.updateOne(filter, updatedDoc);
        console.log("Update Result:", result);

        if (result.modifiedCount === 1) {
          res.send({ success: true, message: "Document updated successfully" });
        } else {
          res
            .status(500)
            .send({ success: false, message: "Failed to update document" });
        }
      } catch (error) {
        console.error("Error:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });
    app.get("/api/petList", async (req, res) => {
      try {
        const { page = 1, pageSize = 12, category, search } = req.query;
        // const query = {};
        const query = {
          adopted: false,
        };
        if (category && category !== "All") {
          query.category = category;
        }

        if (search) {
          query.name = { $regex: new RegExp(search, "i") };
        }
        try {
          const pets = await petlists
            .find(query)
            .sort({ dateField: -1 })
            .skip((page - 1) * pageSize)
            .limit(Number(pageSize))
            .toArray();
          const totalPets = await petlists.countDocuments(query);
          const totalPages = Math.ceil(totalPets / pageSize);

          res.json({
            pets,
            totalPages,
            success: true,
          });
        } catch (error) {
          console.error("Error fetching pet data:", error);
          res.status(500).json({
            success: false,
            error: "Internal Server Error",
          });
        }
      } catch (error) {
        console.error(error);
        next(error);
      }
    });
    app.post("/api/petList", async (req, res) => {
      try {
        const data = req.body;
        const result = await petlists.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/api/allDonationCamp", async (req, res) => {
      try {
        const { page = 1, pageSize = 12 } = req.query;
        const skip = (page - 1) * pageSize;
        const result = await doanationCamp
          .find({})
          .skip(skip)
          .limit(Number(pageSize))
          .toArray();
        const total = await doanationCamp.countDocuments({});
        const totalPages = Math.ceil(total / pageSize);
        res.send({
          totalPages,
          result,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/api/createDonationCamp", verifyToken, async (req, res) => {
      try {
        const data = req.body;
        const result = await doanationCamp.insertOne(data);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    // verifyToken,
    app.get("/api/myDonationCamp", verifyToken, async (req, res) => {
      try {
        const query = { email: req.query.email };
        console.log(query);
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;
        const cursor = await doanationCamp.find(query).skip(skip).limit(limit);
        const result = await cursor.toArray();
        const total = await doanationCamp.countDocuments(query);
        res.send({
          total,
          result,
        });
      } catch (error) {
        console.log(error);
      }
    });
    app.delete("/api/myDonationCamp/:id", verifyToken, async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doanationCamp.deleteOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/api/allDonationCamp/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await doanationCamp.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/api/allDonationCamp/:id", verifyToken, async (req, res) => {
      try {
        const defaultData = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            email: defaultData.email,
            name: defaultData.name,
            amount: defaultData.amount,
            image: defaultData.image,
            last_date: defaultData.last_date,
            shortDescription: defaultData.shortDescription,
            longDescription: defaultData.longDescription,
            // dateField: moment().format("YYYY-MM-DD"),
          },
        };
        const result = await doanationCamp.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch(
      "/api/myDonationCampPaused/:id",
      verifyToken,
      async (req, res) => {
        try {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              campaignPause: true,
            },
          };
          const result = await doanationCamp.updateOne(filter, updatedDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );
    app.patch(
      "/api/myDonationCampUnPaused/:id",
      verifyToken,
      async (req, res) => {
        try {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              campaignPause: false,
            },
          };
          const result = await doanationCamp.updateOne(filter, updatedDoc);
          res.send(result);
        } catch (error) {
          console.log(error);
        }
      }
    );
    app.get("/api/myAddPet", verifyToken, async (req, res) => {
      try {
        const query = { email: req.query.email };
        const page = Number(req.query.page);
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;
        const cursor = await petlists.find(query).skip(skip).limit(limit);
        const result = await cursor.toArray();
        const total = await petlists.countDocuments(query);
        res.send({
          total,
          result,
        });
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/api/myAddPet/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await petlists.findOne(query);

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.delete("/api/myAddPet/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await petlists.deleteOne(query);
        console.log(result);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.get("/api/petList/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await petlists.findOne(query);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });
    app.patch("/api/petList/:id", async (req, res) => {
      try {
        const item = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            name: item.name,
            age: item.age,
            image: item.image,
            category: item.category,
            location: item.location,
            longDescription: item.longDescription,
            shortDescription: item.shortDescription,
          },
        };
        const result = await petlists.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.post("/api/create-donate-intent", async (req, res) => {
      const { amount } = req.body;
      console.log(amount);
      const TotalAmount = parseInt(amount * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: TotalAmount,
        currency: "usd",
        payment_method_types: ["card"],
        // automatic_payment_methods: {
        //   enabled: true,
        // },
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
    app.post("/api/donates", async (req, res) => {
      try {
        const donateDetails = req.body;
        const result = await donatesCollection.insertOne(donateDetails);
        res.send({ result });
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/api/donators/:campId", async (req, res) => {
      try {
        const campId = req.params.campId;
        // console.log(campId);
        const query = { campIds: campId };
        const cursor = await donatesCollection.find(query);
        const result = await cursor.toArray();
        // console.log(result);
        res.send({
          result,
        });
      } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/api/mydonation/:email", async (req, res) => {
      try {
        const query = { email: req.query.email };
        const cursor = await donatesCollection.find(query);
        const result = await cursor.toArray();
        const total = await donatesCollection.countDocuments(query);
        res.send({
          total,
          result,
        });
      } catch (error) {
        console.log(error);
      }
    });

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
  res.send("Hello from Petadopy Server..");
});

app.listen(port, () => {
  console.log(`Petadopy is running on port ${port}`);
});
