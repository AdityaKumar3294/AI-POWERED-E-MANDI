const GradingReport = require("../models/GradingReport");
const { analyzeImage } = require("../services/aiService");

const analyzeGrading = async (req, res) => {
  try {
    // User must upload an image
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tomato image is required",
      });
    }

    // Send image to FastAPI AI service
    const aiResult = await analyzeImage(req.file.path);

    // Make sure AI returned a valid result
    if (!aiResult || !aiResult.success) {
      return res.status(400).json({
        success: false,
        message: aiResult?.error || "AI grading failed",
      });
    }

    // Save grading result in MongoDB
    const report = await GradingReport.create({
      farmerId: req.user.userId,
      total: aiResult.total,
      healthy: aiResult.healthy,
      defective: aiResult.defective,
      defectPercentage: aiResult.defectPercentage,
      averageSize: aiResult.averageSize || "unknown",
      grade: aiResult.grade,
      imageUrl: req.file.filename,
    });

    res.status(201).json({
      success: true,
      message: "Tomato grading completed successfully",
      gradingReportId: report._id,
      result: {
        total: report.total,
        healthy: report.healthy,
        defective: report.defective,
        defectPercentage: report.defectPercentage,
        averageSize: report.averageSize,
        grade: report.grade,
      },
    });
  } catch (error) {
    console.error("Grading error:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error during grading",
    });
  }
};

const getGradingReportById = async (req, res) => {
  try {
    const report = await GradingReport.findById(req.params.id)
      .populate("farmerId", "name email location");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Grading report not found",
      });
    }

    // Only the farmer who owns the report can access it
    if (report.farmerId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this report",
      });
    }

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get grading report error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching grading report",
    });
  }
};


const getMyGradingReports = async (req, res) => {
  try {
    const reports = await GradingReport.find({
      farmerId: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get grading reports error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching grading reports",
    });
  }
};

module.exports = {
  analyzeGrading,
  getGradingReportById,
  getMyGradingReports,
};