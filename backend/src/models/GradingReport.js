const mongoose = require("mongoose");

const gradingReportSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    healthy: {
      type: Number,
      required: true,
      min: 0,
    },

    defective: {
      type: Number,
      required: true,
      min: 0,
    },

    defectPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    averageSize: {
      type: String,
      enum: ["small", "medium", "large", "unknown"],
      default: "unknown",
    },

    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },

    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const GradingReport = mongoose.model(
  "GradingReport",
  gradingReportSchema
);

module.exports = GradingReport;