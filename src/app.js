// const express = require("express");
// const globalErrorHandler = require("./utils/glovalErrorHandler");
// const applyMiddleware = require("./middlewares");
// const connectDB = require("./db/connectDB");
// require("dotenv").config();
// const app = express();
// const port = process.env.PORT || 5000;
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const authenticationRoutes = require("./routes/authentication/index");
// applyMiddleware(app);
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const categoryRoute = require("./routes/category/index");
// // const petadetailsRoute = require("./routes/petdetails/petdetailsRoute");
// const petListRoute = require("./routes/petListRoute/petListRoute");
// const petDetailsRoute = require("./routes/petDetailsRoute/petDetailsRoute");
// const verifyToken = require("./middlewares/verifyToken");
// // const addAdotRoute = require("./routes/petAdoptRoute/petAdoptRoute");
// // const usersRoute = require("./routes/userRoute/userRoute");
// app.use(authenticationRoutes);
// app.use(categoryRoute);
// app.use(petListRoute);
// app.use(petDetailsRoute);
// // app.use(addAdotRoute);
// // app.use(usersRoute);
// // const uri =
// //   "mongodb+srv://tahidcse:<password>@cluster0.hzpl6mp.mongodb.net/?retryWrites=true&w=majority";
// // const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// const client = new MongoClient(process.env.DB_URI, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     const petadopyDB = client.db("petadopyDB");
//     const usersCollection = petadopyDB.collection("usersCollection");
//     const adoptCollection = petadopyDB.collection("adoptCollection");
//     const petlists = petadopyDB.collection("petlists");
//     const doanationCamp = petadopyDB.collection("doanationCamp");
//     const donatesCollection = petadopyDB.collection("donatesCollection");

//     const verifyAdmin = async (req, res, next) => {
//       const email = req.decoded?.email;
//       const query = { email: email };
//       const user = await usersCollection.findOne(query);
//       const isAdmin = user?.role === "admin";
//       if (!isAdmin) {
//         return res.status(403).send({ message: "forbidden access" });
//       }
//       next();
//     };
//     app.post("/api/users", async (req, res) => {
//       try {
//         const user = req.body;
//         const query = { email: user?.email };
//         const isExist = await usersCollection.findOne(query);
//         if (isExist) {
//           return res.send({ message: "user already exists", insertedId: null });
//         }
//         const result = await usersCollection.insertOne(user);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.get("/api/users", verifyToken, verifyAdmin, async (req, res) => {
//       try {
//         const result = await usersCollection.find().toArray();
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.get("/api/users/:email", verifyToken, async (req, res) => {
//       const email = req.params.email;
//       if (email !== req.decoded.email) {
//         return res.status(403).send({ message: "unauthorised access" });
//       }
//       const query = { email: email };
//       const user = await usersCollection.findOne(query);

//       let admin = false;
//       if (user) {
//         admin = user?.role === "admin";
//       }
//       res.send({ admin });
//     });
//     app.patch("/api/users/admin/:id", verifyToken, async (req, res) => {
//       try {
//         const id = req.params.id;
//         const filter = { _id: new ObjectId(id) };
//         const updateDoc = {
//           $set: {
//             role: "admin",
//           },
//         };
//         const result = await usersCollection.updateOne(filter, updateDoc);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.delete("/api/users/:id", verifyToken, async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await usersCollection.deleteOne(query);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     // admin route
//     app.get("/api/allPets", verifyToken, verifyAdmin, async (req, res) => {
//       try {
//         const { page = 1, pageSize = 12 } = req.query;
//         const result = await petlists
//           .find({})
//           .skip((page - 1) * pageSize)
//           .limit(Number(pageSize))
//           .toArray();
//         const totalPets = await petlists.countDocuments({});
//         const totalPages = Math.ceil(totalPets / pageSize);
//         res.json({
//           result,
//           totalPages,
//           success: true,
//         });
//       } catch (error) {
//         console.log(error);
//         res
//           .status(500)
//           .json({ success: false, error: "Internal Server Error" });
//       }
//     });
//     app.delete(
//       "/api/allPets/:id",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         try {
//           const id = req.params.id;
//           const query = { _id: new ObjectId(id) };
//           const result = await petlists.deleteOne(query);
//           res.send(result);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     );
//     app.patch(
//       "/api/allPets/:id",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         try {
//           const item = req.body;
//           const id = req.params.id;
//           const filter = { _id: new ObjectId(id) };
//           const updatedDoc = {
//             $set: {
//               name: item.name,
//               age: item.age,
//               image: item.image,
//               category: item.category,
//               location: item.location,
//               longDescription: item.longDescription,
//               shortDescription: item.shortDescription,
//             },
//           };
//           const result = await petlists.updateOne(filter, updatedDoc);
//           res.send(result);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     );
//     app.get("/api/allDonations", verifyToken, verifyAdmin, async (req, res) => {
//       try {
//         const { page = 1, pageSize = 12 } = req.query;
//         const skip = (page - 1) * pageSize;
//         const result = await doanationCamp
//           .find({})
//           .skip(skip)
//           .limit(Number(pageSize))
//           .toArray();
//         const total = await doanationCamp.countDocuments({});
//         const totalPages = Math.ceil(total / pageSize);
//         res.send({
//           totalPages,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//       }
//     });
//     app.delete(
//       "/api/allDonations/:id",
//       verifyToken,
//       verifyAdmin,
//       async (req, res) => {
//         try {
//           const id = req.params.id;
//           const query = { _id: new ObjectId(id) };
//           const result = await doanationCamp.deleteOne(query);
//           res.send(result);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     );
//     // admin
//     app.post("/api/adopt", verifyToken, async (req, res) => {
//       try {
//         const data = req.body;
//         const result = await adoptCollection.insertOne(data);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.get("/api/adopt", verifyToken, async (req, res) => {
//       try {
//         const query = { email: req.query.email };
//         console.log(query);
//         const page = Number(req.query.page);
//         const limit = Number(req.query.limit);
//         const skip = (page - 1) * limit;
//         const cursor = await adoptCollection
//           .find(query)
//           .skip(skip)
//           .limit(limit);
//         const result = await cursor.toArray();
//         const total = await adoptCollection.countDocuments(query);
//         res.send({
//           total,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.delete("/api/adopt/:id", verifyToken, async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await adoptCollection.deleteOne(query);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.patch("/api/adopt/:id", async (req, res) => {
//       try {
//         // const defaultData = req.body;
//         const id = req.params.id;
//         const filter = { _id: new ObjectId(id) };
//         const updatedDoc = {
//           $set: {
//             adopted: true,
//           },
//         };
//         const result = await petlists.updateOne(filter, updatedDoc);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.post("/api/petList", async (req, res) => {
//       try {
//         const data = req.body;
//         const result = await petlists.insertOne(data);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });

//     app.get("/api/allDonationCamp", async (req, res) => {
//       try {
//         const { page = 1, pageSize = 12 } = req.query;
//         const skip = (page - 1) * pageSize;
//         const result = await doanationCamp
//           .find({})
//           .skip(skip)
//           .limit(Number(pageSize))
//           .toArray();
//         const total = await doanationCamp.countDocuments({});
//         const totalPages = Math.ceil(total / pageSize);
//         res.send({
//           totalPages,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//       }
//     });

//     app.post("/api/createDonationCamp", verifyToken, async (req, res) => {
//       try {
//         const data = req.body;
//         const result = await doanationCamp.insertOne(data);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     // verifyToken,
//     app.get("/api/myDonationCamp", verifyToken, async (req, res) => {
//       try {
//         const query = { email: req.query.email };
//         console.log(query);
//         const page = Number(req.query.page);
//         const limit = Number(req.query.limit);
//         const skip = (page - 1) * limit;
//         const cursor = await doanationCamp.find(query).skip(skip).limit(limit);
//         const result = await cursor.toArray();
//         const total = await doanationCamp.countDocuments(query);
//         res.send({
//           total,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.delete("/api/myDonationCamp/:id", verifyToken, async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await doanationCamp.deleteOne(query);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.get("/api/allDonationCamp/:id", async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await doanationCamp.findOne(query);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.patch("/api/allDonationCamp/:id", verifyToken, async (req, res) => {
//       try {
//         const defaultData = req.body;
//         const id = req.params.id;
//         const filter = { _id: new ObjectId(id) };
//         const updatedDoc = {
//           $set: {
//             email: defaultData.email,
//             name: defaultData.name,
//             amount: defaultData.amount,
//             image: defaultData.image,
//             last_date: defaultData.last_date,
//             shortDescription: defaultData.shortDescription,
//             longDescription: defaultData.longDescription,
//             // dateField: moment().format("YYYY-MM-DD"),
//           },
//         };
//         const result = await doanationCamp.updateOne(filter, updatedDoc);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.patch(
//       "/api/myDonationCampPaused/:id",
//       verifyToken,
//       async (req, res) => {
//         try {
//           const id = req.params.id;
//           const filter = { _id: new ObjectId(id) };
//           const updatedDoc = {
//             $set: {
//               campaignPause: true,
//             },
//           };
//           const result = await doanationCamp.updateOne(filter, updatedDoc);
//           res.send(result);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     );
//     app.patch(
//       "/api/myDonationCampUnPaused/:id",
//       verifyToken,
//       async (req, res) => {
//         try {
//           const id = req.params.id;
//           const filter = { _id: new ObjectId(id) };
//           const updatedDoc = {
//             $set: {
//               campaignPause: false,
//             },
//           };
//           const result = await doanationCamp.updateOne(filter, updatedDoc);
//           res.send(result);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     );
//     app.get("/api/myAddPet", verifyToken, async (req, res) => {
//       try {
//         const query = { email: req.query.email };
//         const page = Number(req.query.page);
//         const limit = Number(req.query.limit);
//         const skip = (page - 1) * limit;
//         const cursor = await petlists.find(query).skip(skip).limit(limit);
//         const result = await cursor.toArray();
//         const total = await petlists.countDocuments(query);
//         res.send({
//           total,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.get("/api/myAddPet/:id", async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await petlists.findOne(query);

//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.delete("/api/myAddPet/:id", async (req, res) => {
//       try {
//         const id = req.params.id;
//         const query = { _id: new ObjectId(id) };
//         const result = await petlists.deleteOne(query);
//         console.log(result);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     app.patch("/api/petList/:id", async (req, res) => {
//       try {
//         const item = req.body;
//         const id = req.params.id;
//         const filter = { _id: new ObjectId(id) };
//         const updatedDoc = {
//           $set: {
//             name: item.name,
//             age: item.age,
//             image: item.image,
//             category: item.category,
//             location: item.location,
//             longDescription: item.longDescription,
//             shortDescription: item.shortDescription,
//           },
//         };
//         const result = await petlists.updateOne(filter, updatedDoc);
//         res.send(result);
//       } catch (error) {
//         console.log(error);
//       }
//     });

//     app.post("/api/create-donate-intent", async (req, res) => {
//       const { amount } = req.body;
//       console.log(amount);
//       const TotalAmount = parseInt(amount * 100);
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: TotalAmount,
//         currency: "usd",
//         payment_method_types: ["card"],
//         // automatic_payment_methods: {
//         //   enabled: true,
//         // },
//       });
//       res.send({
//         clientSecret: paymentIntent.client_secret,
//       });
//     });
//     app.post("/api/donates", async (req, res) => {
//       try {
//         const donateDetails = req.body;
//         const result = await donatesCollection.insertOne(donateDetails);
//         res.send({ result });
//       } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//       }
//     });

//     app.get("/api/donators/:campId", async (req, res) => {
//       try {
//         const campId = req.params.campId;
//         // console.log(campId);
//         const query = { campIds: campId };
//         const cursor = await donatesCollection.find(query);
//         const result = await cursor.toArray();
//         // console.log(result);
//         res.send({
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).send("Internal Server Error");
//       }
//     });
//     app.get("/api/mydonation/:email", async (req, res) => {
//       try {
//         const query = { email: req.query.email };
//         const cursor = await donatesCollection.find(query);
//         const result = await cursor.toArray();
//         const total = await donatesCollection.countDocuments(query);
//         res.send({
//           total,
//           result,
//         });
//       } catch (error) {
//         console.log(error);
//       }
//     });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//   }
// }
// run().catch(console.dir);

// app.get("/health", (req, res) => {
//   res.send("petadopy is running....");
// });
// app.all("*", (req, res, next) => {
//   const error = new Error(`Can't find ${req.originalUrl} on the server`);
//   error.status = 404;
//   next(error);
// });

// // error handling middleware
// app.use(globalErrorHandler);

// const main = async () => {
//   await connectDB();
//   app.listen(port, () => {
//     console.log(`Petadopy Server is running on port ${port}`);
//   });
// };
// main();
