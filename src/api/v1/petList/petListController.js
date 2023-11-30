// const PetList = require("../../../models/petListModel");

// const findAllList = async (req, res, next) => {
//   try {
//     const { category = "All", page = 1 } = req.query;
//     const query = {};

//     if (category !== "All") {
//       query.category = category;
//     }
//     const perPage = 12;

//     const products = await PetList.find(query)
//       .skip((page - 1) * perPage)
//       .limit(perPage);

//     // const products = await PetList.find(query);

//     res.status(200).json({
//       success: true,
//       products,
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

// module.exports = { findAllList };
const PetList = require("../../../models/petListModel");

const findAllList = async (req, res, next) => {
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
      const pets = await PetList.find(query)
        .sort({ dateField: -1 })
        .skip((page - 1) * pageSize)
        .limit(Number(pageSize));
      const totalPets = await PetList.countDocuments(query);
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
};

module.exports = { findAllList };
