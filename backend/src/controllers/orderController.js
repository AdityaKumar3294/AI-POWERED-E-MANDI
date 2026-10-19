const Order = require("../models/Order");
const Product = require("../models/Product");

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryAddress } = req.body;

    // Validate input
    if (!productId || !quantity || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: "Product ID, quantity and delivery address are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0",
      });
    }

    // Only buyers can place orders
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can place orders",
      });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check product availability
    if (product.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "This product is not available",
      });
    }

    // Check requested quantity
    if (quantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} kg is available`,
      });
    }

    // Calculate total on backend
    const totalAmount = quantity * product.pricePerKg;

    // Reserve product stock
    product.quantity -= quantity;

    if (product.quantity === 0) {
      product.status = "sold_out";
    }

    await product.save();

    // Create order
    const order = await Order.create({
      buyerId: req.user.userId,
      farmerId: product.farmerId,
      productId: product._id,
      quantity,
      pricePerKg: product.pricePerKg,
      totalAmount,
      deliveryAddress,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};


// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "buyer") {
      filter.buyerId = req.user.userId;
    } else if (req.user.role === "farmer") {
      filter.farmerId = req.user.userId;
    }

    const orders = await Order.find(filter)
      .populate("buyerId", "name email location")
      .populate("farmerId", "name email location")
      .populate("productId", "name grade pricePerKg")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};


// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyerId", "name email location")
      .populate("farmerId", "name email location")
      .populate("productId", "name grade pricePerKg");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only buyer or farmer involved in the order can view it
    const userId = req.user.userId;

    if (
      order.buyerId._id.toString() !== userId &&
      order.farmerId._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};


// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "confirmed",
      "rejected",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const userId = req.user.userId;

    // Farmer can confirm/reject/complete
    if (order.farmerId.toString() === userId) {
      if (!["confirmed", "rejected", "completed"].includes(status)) {
        return res.status(403).json({
          success: false,
          message: "Farmer cannot set this status",
        });
      }
    }

    // Buyer can cancel
    else if (order.buyerId.toString() === userId) {
      if (status !== "cancelled") {
        return res.status(403).json({
          success: false,
          message: "Buyer can only cancel an order",
        });
      }
    }

    // Nobody else can update
    else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this order",
      });
    }

    if (
      (status === "rejected" || status === "cancelled") &&
      order.status === "pending"
    ) {
      const product = await Product.findById(order.productId);

      if (product) {
        product.quantity += order.quantity;

        if (product.status === "sold_out" && product.quantity > 0) {
          product.status = "available";
        }

        await product.save();
      }
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};