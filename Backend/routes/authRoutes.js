const express = require("express");
const router = express.Router();

const {
    register,
    login,
    verifyEmail,
    refresh,
    forgotPassword,
    resetPassword,
    logout
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many login attempts. Try again later."
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Try again later."
});

const { resendVerification } = require("../controllers/authController");


router.post("/register", register);
router.post("/refresh", refresh);
router.post("/reset-password/:token", resetPassword);
router.post("/logout", protect, logout);
router.post("/login", loginLimiter, login);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

module.exports = router;