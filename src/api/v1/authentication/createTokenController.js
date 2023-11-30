const jwt = require("jsonwebtoken");
const genarateToken = require("../../../lib/authentication/genarateToken");

const createLocalToken = async (req, res) => {
  try {
    const user = req.body;
    const token = genarateToken(user);
    res.send({ token });
  } catch (error) {
    console.log(error);
  }
};

module.exports = createLocalToken;
