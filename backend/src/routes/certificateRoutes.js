const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
  downloadCertificatePDF,
} = require("../controllers/certificateController");

router.post("/", protect, createCertificate);
router.get("/", protect, getMyCertificates);
router.get("/verify/:certificateId", verifyCertificate);
router.get("/:id/pdf", protect, downloadCertificatePDF);
router.get("/:id", protect, getCertificateById);

module.exports = router;