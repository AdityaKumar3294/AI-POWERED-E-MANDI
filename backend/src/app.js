const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const gradingRoutes = require("./routes/gradingRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AgriGrade AI backend is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);
// Product routes
app.use("/api/products", productRoutes);
app.use("/api/grading", gradingRoutes);
app.use("/api/certificates", certificateRoutes);

module.exports = app;