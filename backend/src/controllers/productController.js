const Product = require("../models/Product");

// CREATE PRODUCT
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

    // Create product using logged-in farmer's ID
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


// GET ALL AVAILABLE PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      status: "available",
    })
      .populate("farmerId", "name location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmerId", "name location");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Only the farmer who created the product can update it
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

    if (name !== undefined) product.name = name;
    if (quantity !== undefined) product.quantity = quantity;
    if (pricePerKg !== undefined) product.pricePerKg = pricePerKg;
    if (grade !== undefined) product.grade = grade;
    if (status !== undefined) product.status = status;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
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