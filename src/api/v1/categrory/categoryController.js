const findAllCategory = require("../../../lib/category/findAllCategory");

const findAll = async (req, res) => {
  const allCategory = await findAllCategory();
  res.send(allCategory);
};

module.exports = findAll;
