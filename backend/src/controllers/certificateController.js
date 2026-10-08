const Certificate = require("../models/Certificate");
const GradingReport = require("../models/GradingReport");
const generateCertificateId = require("../utils/generateCertificateId");

// CREATE CERTIFICATE FROM GRADING REPORT
const createCertificate = async (req, res) => {
  try {
    const { gradingReportId, produceName } = req.body;

    if (!gradingReportId) {
      return res.status(400).json({
        success: false,
        message: "Grading report ID is required",
      });
    }

    // Find the grading report
    const report = await GradingReport.findById(gradingReportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Grading report not found",
      });
    }

    // Make sure the logged-in farmer owns this report
    if (report.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a certificate for this report",
      });
    }

    // Prevent duplicate certificate for the same grading report
    const existingCertificate = await Certificate.findOne({
      gradingReportId: report._id,
    });

    if (existingCertificate) {
      return res.status(409).json({
        success: false,
        message: "Certificate already exists for this grading report",
        certificate: existingCertificate,
      });
    }

    // Create certificate
    const certificate = await Certificate.create({
      certificateId: generateCertificateId(),

      farmerId: report.farmerId,

      gradingReportId: report._id,

      produceName: produceName || "Tomatoes",

      grade: report.grade,

      totalProduce: report.total,

      healthyProduce: report.healthy,

      defectiveProduce: report.defective,

      defectPercentage: report.defectPercentage,

      averageSize: report.averageSize || "unknown",
    });

    res.status(201).json({
      success: true,
      message: "Digital certificate created successfully",

      certificate: {
        id: certificate._id,
        certificateId: certificate.certificateId,
        produceName: certificate.produceName,
        grade: certificate.grade,
        totalProduce: certificate.totalProduce,
        healthyProduce: certificate.healthyProduce,
        defectiveProduce: certificate.defectiveProduce,
        defectPercentage: certificate.defectPercentage,
        averageSize: certificate.averageSize,
        issuedAt: certificate.issuedAt,
        valid: certificate.valid,
      },
    });
  } catch (error) {
    console.error("Create certificate error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating certificate",
    });
  }
};

module.exports = {
  createCertificate,
};