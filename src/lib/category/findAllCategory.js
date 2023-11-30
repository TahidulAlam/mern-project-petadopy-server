const petCategoty = require("../../models/petCategory");

const findAllCategory = async () => {
  const cursor = await petCategoty.find();
  //   const cursor = await petCategoty.insertMany();

  return cursor;
};

module.exports = findAllCategory;
