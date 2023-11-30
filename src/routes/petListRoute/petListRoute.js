const { findAllList } = require("../../api/v1/petList/petListController");
// const findAllList = require("../../api/v1/petList/petNewListController");
const router = require("express").Router();

router.get("/api/petList", findAllList);

module.exports = router;
