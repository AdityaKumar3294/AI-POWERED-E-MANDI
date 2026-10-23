
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

    // Map FastAPI response fields.
    const total = ai.total_count;
    const healthy = ai.fresh_count;
    const defective = ai.rotten_count;
    const defectPercentage = ai.defect_percentage;

    // Read tomato detections.
    const detections = Array.isArray(ai.detections)
      ? ai.detections
      : [];

    // Calculate each valid bounding-box area in square pixels.
    const validAreas = detections
      .map((detection) => {
        const box = detection.box;

        if (!Array.isArray(box) || box.length !== 4) {
          return null;
        }

        const [x1, y1, x2, y2] = box;

        if (
          ![x1, y1, x2, y2].every(Number.isFinite) ||
          x2 <= x1 ||
          y2 <= y1
        ) {
          return null;
        }

        return (x2 - x1) * (y2 - y1);
      })
      .filter((area) => area !== null);

    // Store the average area separately as a number.
    const averageSizePixels =
      validAreas.length > 0
        ? Math.round(
            validAreas.reduce((sum, area) => sum + area, 0) /
              validAreas.length
          )
        : null;

    // Assign a provisional category based on pixel area.
    // These thresholds are for demonstration, not AGMARK standards.
    let averageSize = "unknown";

    if (averageSizePixels !== null) {
      if (averageSizePixels < 10000) {
        averageSize = "small";
      } else if (averageSizePixels < 30000) {
        averageSize = "medium";
      } else {
        averageSize = "large";
      }
    }

    // Demo grading thresholds based on defect percentage.
    let grade = "C";

    if (
      Number.isFinite(defectPercentage) &&
      defectPercentage < 10
    ) {
      grade = "A";
    } else if (
      Number.isFinite(defectPercentage) &&
      defectPercentage <= 25
    ) {
      grade = "B";
    }

    return {
      success: true,
      total,
      healthy,
      defective,
      defectPercentage,
      averageSize,
      averageSizePixels,
      grade,
      detections,
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
