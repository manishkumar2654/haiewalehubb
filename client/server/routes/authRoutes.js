const express = require("express");
const {
  register,
  login,
  googleLogin,
  sendPhoneVerification,
  verifyPhone,
  verifyEmail,
  sendVerificationEmail,
  forgotPassword,
  resetPassword,
  getUserProfile, // import the new method
} = require("../controllers/authController");

const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/send-phone-verification", protect, sendPhoneVerification);
router.post("/verify-phone", protect, verifyPhone);
router.get("/verify-email/:token", verifyEmail);
router.post("/send-verification-email", protect, sendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// In your user routes

// New profile route
router.get("/me", protect, getUserProfile);

module.exports = router;
