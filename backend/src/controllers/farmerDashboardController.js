
const Product = require("../models/Product");
const Order = require("../models/Order");
const GradingReport = require("../models/GradingReport");
const Certificate = require("../models/Certificate");

const getFarmerDashboard = async (req, res) => {
  try {
    const farmerId = req.user.userId;

    // Fetch product inventory and order statistics in parallel.
    const [
      totalProducts,
      availableProducts,
      soldOutProducts,
      inactiveProducts,
      inventory,
      orderStats,
      recentOrders,
      totalGradingReports,
      totalCertificates,
    ] = await Promise.all([
      Product.countDocuments({ farmerId }),

      Product.countDocuments({
        farmerId,
        status: "available",
      }),

      Product.countDocuments({
        farmerId,
        status: "sold_out",
      }),

      Product.countDocuments({
        farmerId,
        status: "inactive",
      }),

      Product.aggregate([
        { $match: { farmerId: req.user.userId ? require("mongoose").Types.ObjectId.createFromHexString(farmerId) : null } },
        {
          $group: {
            _id: null,
            totalStockKg: { $sum: "$quantity" },
          },
        },
      ]),

      Order.aggregate([
        { $match: { farmerId: require("mongoose").Types.ObjectId.createFromHexString(farmerId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            salesAmount: {
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

      Order.find({ farmerId })
        .populate("buyerId", "name location")
        .populate("productId", "name image grade pricePerKg")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      GradingReport.countDocuments({ farmerId }),

      Certificate.countDocuments({ farmerId }),
    ]);

    const counts = {
      pending: 0,
      confirmed: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0,
    };

    let completedSalesAmount = 0;

    for (const stat of orderStats) {
      counts[stat._id] = stat.count;

      if (stat._id === "completed") {
        completedSalesAmount = stat.salesAmount;
      }
    }

    return res.status(200).json({
      success: true,
      dashboard: {
        products: {
          total: totalProducts,
          available: availableProducts,
          soldOut: soldOutProducts,
          inactive: inactiveProducts,
          totalStockKg: inventory[0]?.totalStockKg || 0,
        },
        orders: {
          total: Object.values(counts).reduce(
            (sum, count) => sum + count,
            0
          ),
          ...counts,
        },
        sales: {
          completedSalesAmount,
          currency: "INR",
        },
        aiGrading: {
          totalReports: totalGradingReports,
          totalCertificates,
        },
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Farmer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load farmer dashboard",
    });
  }
};

module.exports = { getFarmerDashboard };
