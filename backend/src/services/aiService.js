const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const analyzeImage = async (imagePath) => {
  try {
    const formData = new FormData();

    formData.append("image", fs.createReadStream(imagePath));

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/api/predict`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI service error:",
      error.response?.data || error.message
    );

    throw new Error("AI service unavailable");
  }
};

module.exports = {
  analyzeImage,
};