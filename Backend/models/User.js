const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {     type: String, required: true, trim: true },
    email: {    type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {     type: String, enum: ["citizen", "official", "admin"], required: true },
    location: { type: String, required: true },
    officialId: { type: String, unique: true, sparse: true },
    isOfficialVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    isVerified: { type: Boolean, default: false } // For officials
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
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
