const User = require("../models/User");
const Petition = require("../models/Petition");

/* ================= GET CURRENT USER ================= */

exports.getCurrentUser = async (req, res) => {

  try {

    const user = await User.findById(req.user._id)
      .select("-password -refreshToken -resetPasswordToken -resetPasswordExpires -failedLoginAttempts -__v");

    res.json(user);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch user"
    });

  }

};

/* ================= USER ACTIVITY ================= */


exports.getUserActivity = async (req, res) => {

  try {

    const created = await Petition
      .find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title createdAt");

    const signed = await Petition
      .find({ signatures: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("title createdAt");

    const activity = [];

    created.forEach(p => {
      activity.push({
        type: "created",
        message: `You created petition "${p.title}"`,
        time: p.createdAt
      });
    });

    signed.forEach(p => {
      activity.push({
        type: "signed",
        message: `You signed petition "${p.title}"`,
        time: p.createdAt
      });
    });

    activity.sort((a,b)=> new Date(b.time)-new Date(a.time));

    res.json(activity.slice(0,5));

  } catch (error) {

    res.status(500).json({
      message: "Activity fetch failed"
    });

  }

};

/* ================= AVATAR UPLOAD ================= */

exports.uploadAvatar = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const user = await User.findById(req.user.id);

    user.avatar = req.file.filename;

    await user.save();

    res.json({
      message: "Avatar uploaded",
      avatar: user.avatar
    });

  } catch (error) {

    res.status(500).json({
      message: "Upload failed"
    });

  }

};