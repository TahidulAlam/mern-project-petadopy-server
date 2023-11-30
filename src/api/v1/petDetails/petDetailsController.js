const PetList = require("../../../models/petListModel");

const findDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await PetList.findById(req.params.id);
    if (!result) {
      return next(new ErrorHandler("Product Not Found", 404));
    }

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
    next(error);
  }
};
module.exports = findDetails;
