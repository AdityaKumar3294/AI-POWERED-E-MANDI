const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    gradingReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradingReport",
      required: true,
    },

    produceName: {
      type: String,
      required: true,
      trim: true,
      default: "Tomatoes",
    },

    grade: {
      type: String,
      enum: ["A", "B", "C"],
      required: true,
    },

    totalProduce: {
      type: Number,
      required: true,
      min: 0,
    },

    healthyProduce: {
      type: Number,
      required: true,
      min: 0,
    },

    defectiveProduce: {
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

    issuedAt: {
      type: Date,
      default: Date.now,
    },

    valid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model(
  "Certificate",
  certificateSchema
);

module.exports = Certificate;