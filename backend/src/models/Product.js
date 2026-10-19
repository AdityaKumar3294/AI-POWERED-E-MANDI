
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    pricePerKg: {
      type: Number,
      required: true,
      min: 0,
    },

    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },

    certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },

    gradingReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradingReport",
      default: null,
    },

    status: {
      type: String,
      enum: ["available", "sold_out", "inactive"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;