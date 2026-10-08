const express = require("express");

const {
  analyzeGrading,
  getGradingReportById,
  getMyGradingReports,
} = require("../controllers/gradingController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Analyze tomato image
router.post(
  "/analyze",
  protect,
  upload.single("image"),
  analyzeGrading
);

// Get all grading reports of logged-in farmer
router.get(
  "/reports",
  protect,
  getMyGradingReports
);

// Get one grading report
router.get(
  "/reports/:id",
  protect,
  getGradingReportById
);

module.exports = router;