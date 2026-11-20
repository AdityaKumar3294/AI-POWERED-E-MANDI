const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  createDemoOTP,
  verifyDemoOTP,
} = require("../utils/demoOtpStore");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      preferredLanguage,
      role,
      location,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      preferredLanguage: preferredLanguage || "hi",
      role: role || "buyer",
      location: location || "",
    });

    // Never return password
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        preferredLanguage: user.preferredLanguage,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const requestDemoOTP = async (req, res) => {
  try {
    if (
      process.env.NODE_ENV !== "development" ||
      process.env.DEMO_OTP_ENABLED !== "true"
    ) {
      return res.status(403).json({
        success: false,
        message: "Demo OTP is disabled",
      });
    }

    const { phone } = req.body;

    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid phone number with country code",
      });
    }

    const otp = createDemoOTP(phone);

    // Development demo only: never expose OTP in production.
    return res.status(200).json({
      success: true,
      message: "Demo OTP generated. No SMS was sent.",
      demo: true,
      otp,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error("Demo OTP request error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate demo OTP",
    });
  }
};


const verifyDemoOTPController = async (req, res) => {
  try {
    if (
      process.env.NODE_ENV !== "development" ||
      process.env.DEMO_OTP_ENABLED !== "true"
    ) {
      return res.status(403).json({
        success: false,
        message: "Demo OTP is disabled",
      });
    }

    const { phone, otp } = req.body;

    if (!phone || !/^\+?[1-9]\d{7,14}$/.test(phone) ||
        !/^\d{6}$/.test(String(otp || ""))) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number and six-digit OTP are required",
      });
    }

    const result = verifyDemoOTP(phone, String(otp));

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Demo OTP verified. This does not verify real phone ownership.",
      demo: true,
    });
  } catch (error) {
    console.error("Demo OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify demo OTP",
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getMe,
  requestDemoOTP,
  verifyDemoOTPController,
};