const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create product - farmer only
router.post("/", protect, createProduct);

// Get available products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

router.put("/:id", protect, updateProduct);

module.exports = router;