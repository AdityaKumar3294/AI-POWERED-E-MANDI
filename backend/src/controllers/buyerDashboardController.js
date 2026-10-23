
const mongoose = require("mongoose");
const Order = require("../models/Order");

const getBuyerDashboard = async (req, res) => {
  try {
    const buyerId = new mongoose.Types.ObjectId(req.user.userId);

    const [
      orderStats,
      recentOrders,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { buyerId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            completedAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  "$totalAmount",
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.find({ buyerId: req.user.userId })
        .populate("farmerId", "name location")
        .populate("productId", "name grade pricePerKg")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const orders = {
      total: 0,
      pending: 0,
      confirmed: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
    };

    let completedSpending = 0;

    for (const stat of orderStats) {
      orders[stat._id] = stat.count;
      orders.total += stat.count;

      if (stat._id === "completed") {
        completedSpending = stat.completedAmount;
      }
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        orders,
        spending: {
          completedOrdersAmount: completedSpending,
          currency: "INR",
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Get buyer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load buyer dashboard",
    });
  }
};

module.exports = { getBuyerDashboard };
