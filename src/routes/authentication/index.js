var express = require("express");
const createLocalToken = require("../../api/v1/authentication/createTokenController");

const router = express.Router();

router.post("/jwt", createLocalToken);

module.exports = router;
