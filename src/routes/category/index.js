const findAll = require("../../api/v1/categrory/categoryController");

const router = require("express").Router();

router.get("/api/category", findAll);

module.exports = router;
