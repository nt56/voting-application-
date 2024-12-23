const User = require("../models/user");

//helper function - check the user is admin or not
const isAdmin = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return err;
  }
};

module.exports = { isAdmin };
