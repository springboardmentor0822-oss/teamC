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

const User = require("../models/User");

exports.getOfficialsList = async (req, res) => {
  try {
    const { location, search } = req.query;

    let filter = { role: "official" };

    // optional location filter
    if (location) {
      filter.location = location;
    }

    // optional search
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const officials = await User.find(filter).select(
      "name location department profileImage"
    );

    res.json(officials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching officials" });
  }
};