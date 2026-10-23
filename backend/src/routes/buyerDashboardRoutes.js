
const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getBuyerDashboard,
} = require("../controllers/buyerDashboardController");

const router = express.Router();

router.get("/", protect, (req, res, next) => {
  if (req.user.role !== "buyer") {
    return res.status(403).json({
      success: false,
      message: "Only buyers can access this dashboard",
    });
  }

  next();
}, getBuyerDashboard);

module.exports = router;
