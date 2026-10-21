
const mongoose = require("mongoose");
const Product = require("../models/Product");

// Allowed values from Product.js
const ALLOWED_GRADES = ["A", "B", "C"];
const ALLOWED_STATUSES = ["available", "sold_out", "inactive"];

// Validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate a positive number
const isPositiveNumber = (value) => {
  return (
    value !== "" &&
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value)) &&
    Number(value) > 0
  );
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    // Only farmers can create products
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
    if (
      typeof name !== "string" ||
      !name.trim() ||
      quantity === undefined ||
      pricePerKg === undefined ||
      grade === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, quantity, pricePerKg and grade are required",
      });
    }

    // Validate quantity
    if (!isPositiveNumber(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    // Product schema requires quantity >= 1
    if (Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Validate price
    if (!isPositiveNumber(pricePerKg)) {
      return res.status(400).json({
        success: false,
        message: "Price per kg must be greater than zero",
      });
    }

    // Validate grade
    if (!ALLOWED_GRADES.includes(grade)) {
      return res.status(400).json({
        success: false,
        message: "Grade must be A, B, or C",
      });
    }

    // Validate optional certificate ID
    if (
      certificateId &&
      !isValidObjectId(certificateId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate ID",
      });
    }

    // Validate optional grading report ID
    if (
      gradingReportId &&
      !isValidObjectId(gradingReportId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid grading report ID",
      });
    }

    const product = await Product.create({
      farmerId: req.user.userId,
      name: name.trim(),
      quantity: Number(quantity),
      pricePerKg: Number(pricePerKg),
      grade,
      certificateId: certificateId || null,
      gradingReportId: gradingReportId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Product listed successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// GET ALL AVAILABLE PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "available",
    })
      .populate("farmerId", "name location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id).populate(
      "farmerId",
      "name location"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Only the owner can update the product
    if (product.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own products",
      });
    }

    const {
      name,
      quantity,
      pricePerKg,
      grade,
      status,
    } = req.body;

    const allowedFields = [
      "name",
      "quantity",
      "pricePerKg",
      "grade",
      "status",
    ];

    const hasUpdate = allowedFields.some(
      (field) => req.body[field] !== undefined
    );

    if (!hasUpdate) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    // Validate and update name
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name must not be empty",
        });
      }

      product.name = name.trim();
    }

    // Validate and update quantity
    if (quantity !== undefined) {
      if (!isPositiveNumber(quantity) || Number(quantity) < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be at least 1",
        });
      }

      product.quantity = Number(quantity);
    }

    // Validate and update price
    if (pricePerKg !== undefined) {
      if (!isPositiveNumber(pricePerKg)) {
        return res.status(400).json({
          success: false,
          message: "Price per kg must be greater than zero",
        });
      }

      product.pricePerKg = Number(pricePerKg);
    }

    // Validate and update grade
    if (grade !== undefined) {
      if (!ALLOWED_GRADES.includes(grade)) {
        return res.status(400).json({
          success: false,
          message: "Grade must be A, B, or C",
        });
      }

      product.grade = grade;
    }

    // Validate and update status
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Status must be available, sold_out, or inactive",
        });
      }

      product.status = status;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
};
