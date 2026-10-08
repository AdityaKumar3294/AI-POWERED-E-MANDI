const crypto = require("crypto");

const generateCertificateId = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const randomPart = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `AGRI-${date}-${randomPart}`;
};

module.exports = generateCertificateId;