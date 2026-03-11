const Petition = require("../models/Petition");
const notificationService =
  require("../services/notificationService");

/* CREATE PETITION */

exports.createPetition = async (req, res, next) => {
  try {

    const {
      title,
      description,
      category,
      signatureGoal
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message:
          "Title, category and description are required",
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

/*  GET PETITIONS (FILTER + SEARCH) */

exports.getPetitions = async (req, res, next) => {
  try {

    let filter = {};
    // filter by category, status, location, search
    if (req.query.category) {
      filter.category = req.query.category;
    }
 
    if (req.query.status) {
      filter.status = req.query.status;
    }
 
    if (req.query.myLocation === "true") {
      filter.location = req.user.location;
    }

    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i"
      };
    }

    const petitions = await Petition.find(filter)
      .populate("createdBy", "name")
      .populate("responses.official", "name role")
      .sort({ createdAt: -1 });

    res.json(petitions);

  } catch (error) {
    next(error);
  }
};

/* SIGN PETITION */

exports.signPetition = async (req, res, next) => {
  try {

    const petition =
      await Petition.findById(req.params.id);

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
    petition.signaturescount += 1;

    /* - Notify Creator - */

    await notificationService.createNotification(
      petition.createdBy,
      "PETITION_SIGNED",
      "Someone signed your petition",
      petition._id
    );

    /* - Auto Escalation - */

    if (
      petition.signatureGoal &&
      petition.signatures.length >=
      petition.signatureGoal &&
      petition.status === "active"
    ) {

      petition.status = "under_review";

      await notificationService.createNotification(
        petition.createdBy,
        "PETITION_GOAL_REACHED",
        "Your petition reached its signature goal and is under review",
        petition._id
      );
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

/* OFFICIAL RESPONSE */

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

    const petition =
      await Petition.findById(petitionId);

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

    /* - Auto Under Review - */

    if (petition.status === "active") {
      petition.status = "under_review";
    }

    /* - Status Validation - */

    if (statusUpdate) {

      if (!["under_review", "closed"]
        .includes(statusUpdate)) {

        return res.status(400).json({
          message: "Invalid status update"
        });
      }

      petition.status = statusUpdate;
    }

    /* - Save Response - */

    petition.responses.push({
      official: req.user._id,
      message,
      statusUpdate
    });

    await petition.save();

    /* - Notify Creator - */

    await notificationService.createNotification(
      petition.createdBy,
      "OFFICIAL_RESPONSE",
      "An official responded to your petition",
      petition._id
    );

    /* - Notify Signers if Closed - */

    if (petition.status === "closed") {

      await Promise.all(
        petition.signatures.map(signer =>
          notificationService.createNotification(
            signer,
            "PETITION_CLOSED",
            "A petition you signed has been closed",
            petition._id
          )
        )
      );
    }

    res.status(200).json({
      message: "Response submitted",
      petition
    });

  } catch (error) {
    next(error);
  }
};

/*DASHBOARD STATS (STRONGER)*/

exports.getDashboardStats = async (req, res, next) => {
  try {

    const total =
      await Petition.countDocuments({
        createdBy: req.user._id
      });

    const active =
      await Petition.countDocuments({
        createdBy: req.user._id,
        status: "active"
      });

    const underReview =
      await Petition.countDocuments({
        createdBy: req.user._id,
        status: "under_review"
      });

    const closed =
      await Petition.countDocuments({
        createdBy: req.user._id,
        status: "closed"
      });

    res.json({
      total,
      active,
      underReview,
      closed
    });

  } catch (error) {
    next(error);
  }
};

/* GET MY PETITIONS */

exports.getMyPetitions = async (req, res, next) => {
  try {

    const petitions =
      await Petition.find({
        createdBy: req.user._id
      }).sort({ createdAt: -1 });

    res.json(petitions);

  } catch (error) {
    next(error);
  }
};

/* DELETE PETITION */

exports.deletePetition = async (req, res, next) => {
  try {

    const petition =
      await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found"
      });
    }

    if (
      petition.createdBy.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Not authorized"
      });
    }

    await petition.deleteOne();

    res.json({
      message:
        "Petition deleted successfully"
    });

  } catch (error) {
    next(error);
  }
};

exports.updatePetition = async (req, res) => {

  const petition = await Petition.findById(req.params.id);

  if (!petition)
    return res.status(404).json({ message: "Petition not found" });

  if (petition.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Not authorized" });

  petition.title = req.body.title;
  petition.description = req.body.description;
  petition.category = req.body.category;
  petition.signatureGoal = req.body.signatureGoal;

  await petition.save();

  res.json({ message: "Petition updated", petition });

};

exports.getPetitionById = async (req, res) => {
  try {

    const petition = await Petition.findById(req.params.id);

    if (!petition) {
      return res.status(404).json({
        message: "Petition not found",
      });
    }

    res.json(petition);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch petition",
    });

  }
};