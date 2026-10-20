
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const analyzeImage = async (imagePath) => {
  try {
    const formData = new FormData();

    // FastAPI expects the field name "file".
    formData.append("file", fs.createReadStream(imagePath));

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/predict`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    const ai = response.data;
    const total = ai.total_count;
    const healthy = ai.fresh_count;
    const defective = ai.rotten_count;
    const defectPercentage = ai.defect_percentage;

    // Demo grading thresholds for this project.
    let grade = "C";
    if (defectPercentage < 10) {
      grade = "A";
    } else if (defectPercentage <= 25) {
      grade = "B";
    }

    return {
      success: true,
      total,
      healthy,
      defective,
      defectPercentage,
      averageSize: "unknown",
      grade,
      detections: ai.detections,
    };
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );
    throw new Error("AI service unavailable");
  }
};

module.exports = { analyzeImage };
