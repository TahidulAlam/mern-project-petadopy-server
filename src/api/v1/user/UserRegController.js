// const userReg = require("../../../models/userModel");

// const userLogDetails = async (req, res, next) => {
//   const userNew = new userReg(req.body);
//   try {
//     const userData = await userNew.save();
//     res.status(200).json(userData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//     next(error);
//   }
// };
// module.exports = userLogDetails;
