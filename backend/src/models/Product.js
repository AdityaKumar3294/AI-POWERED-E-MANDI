
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

    image: {
      type: String,
      default: null,
    },

    
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerKg: {
      type: Number,
      required: true,
      min: 0.01,
    },

    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },

    status: {
      type: String,
      enum: ["available", "sold_out", "inactive"],
      default: "available",
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
