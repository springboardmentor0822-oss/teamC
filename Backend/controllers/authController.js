const User = require("../models/User");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, 
      role: user.role,
      location: user.location
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};


exports.register = async (req, res, next) => {
  try {
    const { name, email, password, location, role, officialId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // If official role selected, require officialId
    if (role === "official" && !officialId) {
      return res.status(400).json({ message: "Official ID required" });
    }

    const user = await User.create({
      name,
      email,
      password,
      location,
      role,
      officialId: role === "official" ? officialId : undefined
    });

    res.status(201).json({
      message: "User registered successfully."
    });

  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, officialId } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    // if official, verify officeId
    if (user.role === "official") {
      if (!officialId || officialId !== user.officialId) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await user.save();

    res.json({ accessToken, refreshToken });

  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const hashed = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findOne({ refreshToken: hashed });

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    user.refreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });

  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `
      <h3>Password Reset</h3>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 10 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset - Civix",
      html: message,
    });

    res.json({ message: "Reset link sent to email" });

  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.refreshToken = undefined;
    await user.save();

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  } 
};

exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.emailVerified)
      return res.status(400).json({ message: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Email - Civix",
      html: `
        <h3>Email Verification</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `
    });

    res.json({ message: "Verification email sent" });

  } catch (error) {
    next(error);
  }
};