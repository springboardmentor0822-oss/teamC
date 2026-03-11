const Petition = require("../models/Petition");

/* ================= USER DASHBOARD ================= */

exports.getStats = async (req, res, next) => {
  try {

    const userId = req.user._id;

    /* ---------- PETITION COUNTS ---------- */

    const total = await Petition.countDocuments({
      createdBy: userId
    });

    const active = await Petition.countDocuments({
      createdBy: userId,
      status: "active"
    });

    const underReview = await Petition.countDocuments({
      createdBy: userId,
      status: "under_review"
    });

    const closed = await Petition.countDocuments({
      createdBy: userId,
      status: "closed"
    });

    /* ---------- SIGNATURE COUNT ---------- */

    const petitions = await Petition.find({
      createdBy: userId
    }).select("signatures");

    const totalSignatures = petitions.reduce(
      (sum, p) => sum + p.signatures.length,
      0
    );

    res.json({
      total,
      active,
      underReview,
      closed,
      totalSignatures
    });

  } catch (error) {
    next(error);
  }
};


/* ================= OFFICIAL DASHBOARD ================= */

exports.getOfficialStats = async (req, res, next) => {
  try {

    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials allowed"
      });
    }

    const location = req.user.location;

    const total = await Petition.countDocuments({
      location
    });

    const underReview = await Petition.countDocuments({
      location,
      status: "under_review"
    });

    const closed = await Petition.countDocuments({
      location,
      status: "closed"
    });

    const responsesGiven = await Petition.countDocuments({
      "responses.official": req.user._id
    });

    res.json({
      total,
      underReview,
      closed,
      responsesGiven
    });

  } catch (error) {
    next(error);
  }
};