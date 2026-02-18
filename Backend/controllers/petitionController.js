const Petition = require("../models/Petition");

exports.createPetition = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    const petition = await Petition.create({
      title,
      description,
      location: req.user.location,
      createdBy: req.user._id,
    });

    res.status(201).json(petition);

  } catch (error) {
    next(error);
  }
};
exports.getPetitions = async (req, res) => {
  res.json({ message: "Get petitions works" });
};

exports.signPetition = async (req, res) => {
  res.json({ message: "Sign petition works" });
};

exports.respondToPetition = async (req, res) => {
  res.json({ message: "Respond petition works" });
};
