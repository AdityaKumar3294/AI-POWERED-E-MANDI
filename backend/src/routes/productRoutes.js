const express = require("express");

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Create product
router.post("/", protect, upload.single("image"), createProduct);

// Get farmer's own products — must come before "/:id"
router.get("/my", protect, getMyProducts);

// Get all available products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Update product
router.put("/:id", protect, upload.single("image"), updateProduct);

// Delete product
router.delete("/:id", protect, deleteProduct);

module.exports = router;