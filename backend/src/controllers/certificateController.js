
const Certificate = require("../models/Certificate");
const GradingReport = require("../models/GradingReport");
const generateCertificateId = require("../utils/generateCertificateId");
const {
  generateCertificateQR,
} = require("../services/qrService");
const {
  generateCertificatePDF,
} = require("../services/certificatePdfService");

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

    // Ensure the logged-in farmer owns this report
    if (report.farmerId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to create a certificate for this report",
      });
    }

    // Prevent duplicate certificates
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

    // Create the certificate
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

    // Generate QR code containing the public verification URL
    const qr = await generateCertificateQR(certificate.certificateId);

    return res.status(201).json({
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
        verificationUrl: qr.verificationUrl,
        qrCodeDataUrl: qr.qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error("Create certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating certificate",
    });
  }
};

// GET ALL CERTIFICATES FOR THE LOGGED-IN FARMER
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      farmerId: req.user.userId,
    })
      .populate("gradingReportId")
      .sort({ createdAt: -1 });

    // Generate QR codes for existing certificates too
    const certificatesWithQR = await Promise.all(
      certificates.map(async (certificate) => {
        const qr = await generateCertificateQR(
          certificate.certificateId
        );

        return {
          ...certificate.toObject(),
          verificationUrl: qr.verificationUrl,
          qrCodeDataUrl: qr.qrCodeDataUrl,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: certificatesWithQR.length,
      certificates: certificatesWithQR,
    });
  } catch (error) {
    console.error("Get certificates error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificates",
    });
  }
};

// GET A CERTIFICATE BY ITS MONGODB ID
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("farmerId", "name location")
      .populate("gradingReportId");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Only allow the certificate owner to access this endpoint
    if (
      certificate.farmerId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this certificate",
      });
    }

    const qr = await generateCertificateQR(certificate.certificateId);

    return res.status(200).json({
      success: true,
      certificate: {
        ...certificate.toObject(),
        verificationUrl: qr.verificationUrl,
        qrCodeDataUrl: qr.qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error("Get certificate error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch certificate",
    });
  }
};

// PUBLIC CERTIFICATE VERIFICATION — NO LOGIN REQUIRED
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    })
      .populate("farmerId", "name location")
      .populate("gradingReportId");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: "Certificate not found",
      });
    }

    if (!certificate.valid) {
      return res.status(200).json({
        success: true,
        verified: false,
        message: "Certificate is no longer valid",
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: "Certificate verified successfully",
      certificate,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);

    return res.status(500).json({
      success: false,
      verified: false,
      message: "Certificate verification failed",
    });
  }
};


const downloadCertificatePDF = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate("farmerId", "name location")
      .populate("gradingReportId");

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    // Only the certificate owner can download it
    if (
      !certificate.farmerId ||
      certificate.farmerId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to download this certificate",
      });
    }

    const pdfBuffer = await generateCertificatePDF(certificate);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certificate.certificateId}.pdf"`
    );

    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Download certificate PDF error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate certificate PDF",
    });
  }
};

module.exports = {
  createCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  downloadCertificatePDF,
};
