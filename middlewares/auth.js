const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new Error("Invalid User....! login ");
  }

  const isValidToken = await jwt.verify(token, process.env.JWT_SECRET);
  const { _id } = isValidToken;
  const user = await User.findById(_id);
  if (!user) {
    throw new Error("User not found...!");
  }

  req.user = user;
  next();
};

module.exports = { userAuth };
