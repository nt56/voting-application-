const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.DB_URL; //local db connection url
// const mongoURL = process.env.DB_URL; //online db connection url

// Set up MongoDB connection
mongoose.connect(mongoURL);

//mogoose maintain a default connection object representing the mongoDB connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on("connected", () => {
  console.log("Connected to MongoDB server");
});
db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
db.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = db;
