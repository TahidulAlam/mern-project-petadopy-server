const adoptDetails = require("../../api/v1/PetAdoptDetails/PetAdoptDetailsController");

const router = require("express").Router();

router.route("/api/addAdopt").post(adoptDetails);
module.exports = router;
