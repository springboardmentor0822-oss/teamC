const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const officialRoutes = require("./routes/officialRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// ---------------------
// Middleware
// ---------------------

app.use(cors());
app.use(express.json()); // Parse JSON body
app.use(helmet()); // Add security headers

// ---------------------
// Database Connection
// ---------------------

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error);
    process.exit(1);
  });

// ---------------------
// Routes
// ---------------------

const authRoutes = require("./routes/authRoutes");
const petitionRoutes = require("./routes/petitionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/petitions", petitionRoutes);
app.use("/api/officials", officialRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

// ---------------------
// Health Check Route
// ---------------------

app.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

// ---------------------
// Error Handling Middleware
// ---------------------

app.use((err, req, res, next) => {
  console.error(err);
  
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// ---------------------
// Start Server
// ---------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});