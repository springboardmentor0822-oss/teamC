const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

exports.createPoll = async (req, res) => {

  try {

    const { title, description, options, expiresAt } = req.body;

    const poll = await Poll.create({

      title,
      description,

      options: options.map(o => ({
        text: o
      })),

      createdBy: req.user._id,
      targetLocation: req.user.location,
      expiresAt

    });

    res.json(poll);

  } catch (error) {

    res.status(500).json({ message: "Failed to create poll" });

  }

};

exports.getPolls = async (req, res) => {

  const polls = await Poll.find({
    targetLocation: req.user.location
  });

  res.json(polls);

};


exports.votePoll = async (req, res) => {

  const { option } = req.body;

  const poll = await Poll.findById(req.params.id);

  if (!poll) {
    return res.status(404).json({ message: "Poll not found" });
  }

  if (poll.expiresAt && poll.expiresAt < new Date()) {
  return res.status(400).json({
    message: "Poll has expired"
  });
}

  const alreadyVoted = await Vote.findOne({
    poll: poll._id,
    user: req.user._id
  });

  if (alreadyVoted) {
    return res.status(400).json({
      message: "You already voted"
    });
  }

  const selected = poll.options.find(o => o.text === option);

  if (!selected) {
    return res.status(400).json({
      message: "Invalid option"
    });
  }

  selected.votes += 1;

  await poll.save();

  await Vote.create({
    poll: poll._id,
    user: req.user._id,
    selectedOption: option
  });

  /* EMIT LIVE UPDATE */

  const updatedPoll = await Poll.findById(poll._id);

  req.app.get("io").emit("pollUpdated", updatedPoll);

  res.json({
    message: "Vote recorded",
    poll: updatedPoll
  });

};