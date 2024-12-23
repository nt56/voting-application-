const express = require("express");
const app = express();
const db = require("./config/db");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());

require("dotenv").config();
const PORT = process.env.PORT || 3000;

// Import the router files
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

// Use the routers
app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log("listening on port 3000");
});
