
const crypto = require("crypto");

const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function createDemoOTP(phone) {
  const otp = String(crypto.randomInt(100000, 1000000));

  otpStore.set(phone, {
    otpHash: crypto.createHash("sha256").update(otp).digest("hex"),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });

  return otp;
}

function verifyDemoOTP(phone, otp) {
  const record = otpStore.get(phone);

  if (!record) {
    return { success: false, message: "OTP not found or expired" };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, message: "OTP expired" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return { success: false, message: "Too many attempts. Request a new OTP" };
  }

  record.attempts += 1;

  const submittedHash = crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");

  const valid =
    submittedHash.length === record.otpHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(record.otpHash, "hex")
    );

  if (!valid) {
    return { success: false, message: "Invalid OTP" };
  }

  otpStore.delete(phone);
  return { success: true, message: "Demo OTP verified" };
}

module.exports = { createDemoOTP, verifyDemoOTP };
