
const QRCode = require("qrcode");

const generateCertificateQR = async (certificateId) => {
  const baseUrl =
    process.env.PUBLIC_API_URL || "http://localhost:5000";

  const verificationUrl =
    `${baseUrl}/api/certificates/verify/` +
    encodeURIComponent(certificateId);

  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
  });

  return {
    verificationUrl,
    qrCodeDataUrl,
  };
};

module.exports = { generateCertificateQR };
