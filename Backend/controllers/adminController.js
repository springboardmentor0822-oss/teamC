const User = require("../models/User");
exports.verifyOfficial = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "official") {
      return res.status(400).json({
        message: "Only officials can be verified",
      });
    }

    user.isVerified = true;
    await user.save();

    res.json({ message: "Official verified successfully" });

  } catch (error) {
    next(error);
  } 
};

exports.getStats = async (req, res, next) => {
  try {
    res.json({
      message: "Stats route working",
      user: req.user,
    });
  } catch (error) {
    next(error);
  } 
};