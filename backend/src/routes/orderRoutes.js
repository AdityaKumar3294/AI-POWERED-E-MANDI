const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Place a new order
router.post("/", protect, createOrder);

// Get orders of logged-in user
router.get("/", protect, getMyOrders);

// Get one order
router.get("/:id", protect, getOrderById);

// Update order status
router.put("/:id/status", protect, updateOrderStatus);

module.exports = router;