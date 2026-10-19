const express = require("express");

const {
  createCertificate,
} = require("../controllers/certificateController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create digital certificate from grading report
router.post(
  "/",
  protect,
  createCertificate
);

module.exports = router;