const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth");
require("dotenv").config();

// POST route to add a person
router.post("/signup", async (req, res) => {
  try {
    // Assuming the request body contains the User data
    const data = req.body;

    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same Aadhar Card Number already exists",
      });
    }

    // Create a new User document using the Mongoose model
    const newUser = new User(data);

    //save new user to the database
    await newUser.save();
    res.status(200).send("User Created Successfully...!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Login Route
router.post("/signin", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    // Check if aadharCardNumber or password is missing
    if (!aadharCardNumber || !password) {
      return res
        .status(401)
        .json({ error: "Aadhar Card Number and password are required" });
    }

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid Aadhar Card Number or Password" });
    }

    // generate Token
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });

    // return token as response
    res.status(200).json("User LoggedIn Successfully...!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Profile route
router.get("/profile", userAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Changing the password
router.put("/profile/password", userAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Extract the id from the token
    const { currentPassword, newPassword } = req.body; // Extract current and new passwords from request body

    // Check if currentPassword and newPassword are present in the request body
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both currentPassword and newPassword are required" });
    }

    // Find the user by userID
    const user = await User.findById(userId);

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid Crediantials" });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    console.log("password updated");
    res.status(200).send("Password updated");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
