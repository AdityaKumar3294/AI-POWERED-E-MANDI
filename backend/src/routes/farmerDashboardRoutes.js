
const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getFarmerDashboard,
} = require("../controllers/farmerDashboardController");

const router = express.Router();

router.get("/", protect, (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({
      success: false,
      message: "Only farmers can access this dashboard",
    });
  }

  next();
}, getFarmerDashboard);

module.exports = router;
