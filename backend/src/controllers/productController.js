const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    // Only farmers can create product listings
    if (req.user.role !== "farmer") {
      return res.status(403).json({
        success: false,
        message: "Only farmers can create product listings",
      });
    }

    const {
      name,
      quantity,
      pricePerKg,
      grade,
      certificateId,
      gradingReportId,
    } = req.body;

    // Validate required fields
    if (!name || !quantity || !pricePerKg || !grade) {
      return res.status(400).json({
        success: false,
        message: "Name, quantity, pricePerKg and grade are required",
      });
    }

    // Create product using the logged-in farmer's ID
    const product = await Product.create({
      farmerId: req.user.userId,
      name,
      quantity,
      pricePerKg,
      grade,
      certificateId: certificateId || null,
      gradingReportId: gradingReportId || null,
    });

    res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

module.exports = {
  createProduct,
};