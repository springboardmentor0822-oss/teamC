const Petition = require("../models/Petition");

exports.getStats = async (req, res, next) => {
  try {

    const userId = req.user._id;

    // ✅ My petitions
    const totalPetitions = await Petition.countDocuments({
      createdBy: userId
    });

    const myPetitions = await Petition.countDocuments({
      createdBy: userId,
    });

    const successfulPetitions = await Petition.countDocuments({
      createdBy: userId,
      status: "closed",
    });

    const activePetitions = await Petition.countDocuments({
      createdBy: userId,
      status: "active"
    });

    const underReviewPetitions = await Petition.countDocuments({
      createdBy: userId,
      status: "under_review"
    });

    const closedPetitions = await Petition.countDocuments({
      createdBy: userId,
      status: "closed"
    });

    // ✅ Total signatures gained
    const petitions = await Petition.find({
      createdBy: userId
    });

    const totalSignatures = petitions.reduce(
      (sum, p) => sum + p.signatures.length,
      0
    );

    res.json({
      totalPetitions,
      activePetitions,
      underReviewPetitions,
      closedPetitions,
      totalSignatures,
      myPetitions,
      successfulPetitions,
      pollsCreated: 0
    });

  } catch (error) {
    next(error);
  }
};

exports.getOfficialStats = async (req, res, next) => {
  try {

    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials allowed"
      });
    }

    const location = req.user.location;

    const totalPetitions = await Petition.countDocuments({
      location
    });

    const underReview = await Petition.countDocuments({
      location,
      status: "under_review"
    });

    const closedPetitions = await Petition.countDocuments({
      location,
      status: "closed"
    });

    const responsesGiven = await Petition.countDocuments({
      "responses.official": req.user._id
    });

    res.json({
      totalPetitions,
      underReview,
      closedPetitions,
      responsesGiven
    });

  } catch (error) {
    next(error);
  }
};