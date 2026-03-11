const express = require("express");
const router = express.Router();

const {
  register,
  login,
  verifyEmail,
  refresh,
  forgotPassword,
  resetPassword,
  logout,
  resendVerification,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many login attempts. Try again later.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Try again later.",
});

router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refresh);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", protect, logout);

router.get("/me", protect, getMe);

// email verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;
