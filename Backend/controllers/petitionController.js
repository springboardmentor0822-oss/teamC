const Petition = require("../models/Petition");
const createNotification = require("../utils/createNotification");

exports.createPetition = async (req, res, next) => {
  try {
    const { title, description, category, signatureGoal } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, category and description are required",
      });
    }

    const petition = await Petition.create({
      title,
      description,
      category,
      signatureGoal,
      location: req.user.location,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Petition created successfully",
      petition,
    });

  } catch (error) {
    next(error);
  }
};

exports.getPetitions = async (req, res, next) => {
  try {
    let filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by my location
    if (req.query.myLocation === "true") {
      filter.location = req.user.location;
    }

    const petitions = await Petition.find(filter)
      .populate("createdBy", "name")
      .populate("responses.official", "name role");

    res.json(petitions);

  } catch (error) {
    next(error);
  }
};


exports.respondToPetition = async (req, res, next) => {
  try {

    const petitionId = req.params.id;
    const { message, statusUpdate } = req.body;

    if (req.user.role !== "official") {
      return res.status(403).json({
        message: "Only officials can respond"
      });
    }

    if (!message) {
      return res.status(400).json({
        message: "Response message required"
      });
    }

    const petition = await Petition.findById(petitionId);

    if (!petition)
      return res.status(404).json({
        message: "Petition not found"
      });

    if (petition.location !== req.user.location)
      return res.status(403).json({
        message: "Region mismatch"
      });

    if (petition.status === "closed")
      return res.status(400).json({
        message: "Petition already closed"
      });

    /* ==========================
       AUTO MOVE TO UNDER REVIEW
    ========================== */

    if (petition.status === "active") {
      petition.status = "under_review";
    }

    /* ==========================
       VALID STATUS UPDATE
    ========================== */

    if (statusUpdate) {

      if (!["under_review", "closed"]
            .includes(statusUpdate)) {

        return res.status(400).json({
          message: "Invalid status update"
        });
      }

      petition.status = statusUpdate;
    }

    /* ==========================
       SAVE RESPONSE
    ========================== */

    petition.responses.push({
      official: req.user._id,
      message,
      statusUpdate
    });

    await petition.save();

    res.status(200).json({
      message: "Response submitted",
      petition
    });

    if (petition.status === "closed") {

      for (const signer of petition.signatures) {

        await createNotification(
          signer,
          "A petition you signed has been closed",
          petition._id
        );
      }
    }

  } catch (error) {
    next(error);
  }
};


exports.signPetition = async (req, res, next) => {
  try {

    const petition = await Petition.findById(req.params.id);
    const userId = req.user._id;

    if (!petition)
      return res.status(404).json({
        message: "Petition not found"
      });

    if (petition.status === "closed")
      return res.status(400).json({
        message: "Petition closed"
      });

    const alreadySigned =
      petition.signatures.some(
        id => id.toString() === userId.toString()
      );

    if (alreadySigned)
      return res.status(400).json({
        message: "Already signed"
      });

    petition.signatures.push(userId);

    await createNotification(
      petition.createdBy,
      "Someone signed your petition",
      petition._id
    );

    /* ==========================
       AUTO ESCALATION
    ========================== */

    if (
      petition.signatures.length >=
      petition.signatureGoal &&
      petition.status === "active"
    ) {
      petition.status = "under_review";
    }

    await petition.save();

    res.json({
      message: "Signed successfully",
      petition
    });

  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    const myPetitions = await Petition.find({
      createdBy: req.user._id
    });

    const successful = myPetitions.filter(
      (p) => p.status === "closed"
    );

    res.json({
      totalPetitions: myPetitions.length,
      successfulPetitions: successful.length
    });

  } catch (error) {
    next(error);
  }
};

exports.getMyPetitions = async (req, res, next) => {
  try {

    const petitions = await Petition.find({
      createdBy: req.user._id
    }).sort({ createdAt: -1 });

    res.json(petitions);

  } catch (error) {
    next(error);
  }
};

exports.deletePetition = async (req, res, next) => {
  try {
    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({ message: "Petition not found" });
    }

    // Only owner can delete
    if (petition.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await petition.deleteOne();

    res.json({ message: "Petition deleted successfully" });

  } catch (error) {
    next(error);
  }
};