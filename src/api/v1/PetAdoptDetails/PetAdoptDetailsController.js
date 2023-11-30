const PetAdoptDetails = require("../../../models/adoptPetModel");

const findDetails = async (req, res, next) => {
  const adoptData = new PetAdoptDetails(req.body);
  try {
    const allAdoptData = await adoptData.save();
    res.status(200).json(allAdoptData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    next(error);
  }
};
module.exports = findDetails;
