const Petition = require("../models/Petition");

exports.getOfficialPetitions = async (req, res, next) => {
  try {
    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials can access this"
      });
    }

    const petitions = await Petition.find({
      location: req.user.location,
      status: { $in: ["active", "under_review"] }
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json({
      count: petitions.length,
      petitions
    });

  } catch (error) {
    next(error);
  }
};