const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  requestDemoOTP,
  verifyDemoOTPController,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/demo-otp/request", requestDemoOTP);
router.post("/demo-otp/verify", verifyDemoOTPController);

module.exports = router;