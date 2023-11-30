// // const PetList = require("../../../models/petListModel");

// const findAllList = async (req, res, next) => {
//   try {
//     const { page = 1, pageSize = 10, category, search } = req.query;

//     const query = {
//       adopted: false,
//     };

//     if (category && category !== "All") {
//       query.category = category;
//     }
//     if (search) {
//       query.name = { $regex: new RegExp(search, "i") };
//     }
//     // const filter = { adopted: true };
//     // console.log(filter);
//     try {
//       const pets = await PetList.find({ query })
//         .sort({ dateField: -1 })
//         .skip((page - 1) * pageSize)
//         .limit(Number(pageSize));
//       const totalPets = await PetList.countDocuments(query);
//       console.log(pets);
//       console.log(totalPets);

//       const totalPages = Math.ceil(totalPets / pageSize);

//       res.json({
//         pets,
//         totalPages,
//       });
//     } catch (error) {
//       console.error("Error fetching pet data:", error);
//       res.status(500).send("Internal Server Error");
//     }
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

// module.exports = { findAllList };
