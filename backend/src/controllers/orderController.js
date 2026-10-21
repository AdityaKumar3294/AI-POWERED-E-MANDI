
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "completed",
  "cancelled",
];

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const isPositiveNumber = (value) =>
  value !== "" &&
  value !== null &&
  value !== undefined &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 1;

// CREATE ORDER
const createOrder = async (req, res) => {
  let reservedProductId = null;
  let reservedQuantity = 0;

  try {
    const { productId, quantity, deliveryAddress } = req.body;

    // Only buyers can place orders
    if (req.user.role !== "buyer") {
      return res.status(403).json({
        success: false,
        message: "Only buyers can place orders",
      });
    }

    // Validate required fields
    if (
      !productId ||
      quantity === undefined ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID, quantity and delivery address are required",
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (!isPositiveNumber(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number greater than or equal to 1",
      });
    }

    const requestedQuantity = Number(quantity);

    // Atomically reserve stock so simultaneous orders cannot
    // reserve the same available quantity.
    const product = await Product.findOneAndUpdate(
      {
        _id: productId,
        status: "available",
        quantity: { $gte: requestedQuantity },
      },
      {
        $inc: { quantity: -requestedQuantity },
      },
      { new: true }
    );

    if (!product) {
      const existingProduct = await Product.findById(productId);

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (existingProduct.status !== "available") {
        return res.status(400).json({
          success: false,
          message: "This product is not available",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Only ${existingProduct.quantity} kg is available`,
      });
    }

    reservedProductId = product._id;
    reservedQuantity = requestedQuantity;

    // Mark product sold out when all stock is reserved
    if (product.quantity === 0) {
      product.status = "sold_out";
      await product.save();
    }

    const totalAmount = requestedQuantity * product.pricePerKg;

    const order = await Order.create({
      buyerId: req.user.userId,
      farmerId: product.farmerId,
      productId: product._id,
      quantity: requestedQuantity,
      pricePerKg: product.pricePerKg,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      status: "pending",
    });

    // Order saved successfully; no rollback needed
    reservedProductId = null;
    reservedQuantity = 0;

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    // Restore reserved stock if order creation failed.
    // This is a compensating rollback, not a database transaction.
    if (reservedProductId && reservedQuantity > 0) {
      try {
        await Product.updateOne(
        {
          _id: reservedProductId,
          status: { $ne: "inactive" },
        },
        {
          $inc: { quantity: reservedQuantity },
          $set: { status: "available" },
        }
      );
      } catch (rollbackError) {
        console.error("Stock rollback error:", rollbackError);
      }
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    let filter;

    if (req.user.role === "buyer") {
      filter = { buyerId: req.user.userId };
    } else if (req.user.role === "farmer") {
      filter = { farmerId: req.user.userId };
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these orders",
      });
    }

    const orders = await Order.find(filter)
      .populate("buyerId", "name email location")
      .populate("farmerId", "name email location")
      .populate("productId", "name grade pricePerKg")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// GET SINGLE ORDER
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(id)
      .populate("buyerId", "name email location")
      .populate("farmerId", "name email location")
      .populate("productId", "name grade pricePerKg");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const buyerId = order.buyerId?._id?.toString();
    const farmerId = order.farmerId?._id?.toString();
    const userId = req.user.userId;

    if (buyerId !== userId && farmerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// UPDATE ORDER STATUS

const updateOrderStatus = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const fail = (statusCode, message) => {
      const error = new Error(message);
      error.statusCode = statusCode;
      throw error;
    };

    if (!isValidObjectId(id)) {
      fail(400, "Invalid order ID");
    }

    if (!ORDER_STATUSES.includes(status)) {
      fail(400, "Invalid order status");
    }

    const userId = req.user.userId;
    let updatedOrder;

    await session.withTransaction(async () => {
      const order = await Order.findById(id).session(session);

      if (!order) {
        fail(404, "Order not found");
      }

      const isFarmer = order.farmerId.toString() === userId;
      const isBuyer = order.buyerId.toString() === userId;

      if (!isFarmer && !isBuyer) {
        fail(403, "You are not authorized to update this order");
      }

      if (
        isFarmer &&
        !["confirmed", "rejected", "completed"].includes(status)
      ) {
        fail(403, "Farmer cannot set this status");
      }

      if (isBuyer && status !== "cancelled") {
        fail(403, "Buyer can only cancel an order");
      }

      // Define permitted transitions.
      const allowedTransitions = {
        pending: ["confirmed", "rejected", "cancelled"],
        confirmed: ["completed"],
        rejected: [],
        completed: [],
        cancelled: [],
      };

      if (!allowedTransitions[order.status]?.includes(status)) {
        fail(
          400,
          `Cannot change order status from ${order.status} to ${status}`
        );
      }

      // Restore stock only when a pending order is rejected or cancelled.
      if (["rejected", "cancelled"].includes(status)) {
        const product = await Product.findById(order.productId)
          .session(session);

        if (product) {
          product.quantity += order.quantity;

          // Do not reactivate products that were deliberately made inactive.
          if (product.status === "sold_out" && product.quantity > 0) {
            product.status = "available";
          }

          await product.save({ session });
        }
      }

      order.status = status;
      await order.save({ session });

      updatedOrder = order;
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Server error while updating order status",
    });
  } finally {
    await session.endSession();
  }
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
