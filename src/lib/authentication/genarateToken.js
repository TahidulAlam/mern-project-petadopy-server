require("dotenv").config();
const jwt = require("jsonwebtoken");
const genarateToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
};

module.exports = genarateToken;
