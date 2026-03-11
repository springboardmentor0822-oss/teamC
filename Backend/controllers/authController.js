const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const crypto = require("crypto");
const sendEmail = require("../services/sendEmail");
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      location: user.location,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

// =============== REGISTER ===============
exports.register = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { name, password, location, role, officialId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const strongPassword = 
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+\[\]{};:'",.<>/?]).{6,}$/;
if (!strongPassword.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 6 characters and include uppercase, lowercase, number, and symbol.",
  });
}



    if (role === "official" && !officialId) {
      return res.status(400).json({ message: "Official ID required" });
    }

    const user = await User.create({
      name,
      email,
      password,
      location,
      role,
      officialId: role === "official" ? officialId : undefined,
    });

    // Optional: send verification email immediately for all users
    // or for officials only – you already have resendVerification.
    // For now just respond success.
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
    });

  } catch (error) {
    next(error);
  }
};

// =============== VERIFY EMAIL ===============
exports.verifyEmail = async (req, res, next) => {
  try {
    const token = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
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

// =============== LOGIN ===============
exports.login = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password, officialId } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Account locked. Try again in a few minutes.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    if (user.role === "official") {
      if (!officialId || officialId !== user.officialId) {
        // count failed attempt
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = Date.now() + LOCK_TIME;
        }
        await user.save();
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // success: reset counters
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

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


// =============== REFRESH TOKEN ===============
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


    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    user.refreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    next(error);
  }
};

// =============== FORGOT PASSWORD ===============
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
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

// =============== RESET PASSWORD ===============
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

// =============== LOGOUT ===============
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

// =============== RESEND VERIFICATION ===============
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ message: "Email already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Email - Civix",
      html: `
        <h3>Email Verification</h3>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });

    res.json({ message: "Verification email sent" });

  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshToken -resetPasswordToken -resetPasswordExpires -failedLoginAttempts -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
