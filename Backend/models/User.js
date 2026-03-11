const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["citizen", "official", "admin"],
      required: true,
    },
    location: { type: String, required: true, trim: true },

    officialId: { type: String, unique: true, sparse: true },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Official extra verification flag if you need it
    isOfficialVerified: { type: Boolean, default: false },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Refresh token (stored hashed)
    refreshToken: String,

    // Optional login protection
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // avatar
    avatar: {
      type: String,
      daefault: ""
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
