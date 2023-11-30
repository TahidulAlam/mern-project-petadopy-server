const findDetails = require("../../api/v1/petDetails/petDetailsController");

const router = require("express").Router();

// router.get("/api/petList/:id", findDetails);
router.route("/api/petList/:id").get(findDetails);
module.exports = router;
