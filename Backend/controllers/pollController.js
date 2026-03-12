const Poll = require("../models/Poll");
const Vote = require("../models/Vote");

exports.createPoll = async (req, res) => {
  try {
    const { title, description, options, expiresAt } = req.body;
    const poll = await Poll.create({
      title,
      description,
      options: options.map(o => ({ text: o })),
      createdBy: req.user._id, // User ID from auth middleware
      targetLocation: req.user.location,
      expiresAt
    });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: "Failed to create poll" });
  }
};

exports.getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ targetLocation: req.user.location });
    const votes = await Vote.find({ user: req.user._id });

    const voteMap = {};
    votes.forEach(v => {
      voteMap[v.poll.toString()] = v.selectedOption;
    });

    const result = polls.map(p => {
      const pollObj = p.toObject();
      pollObj.userVote = voteMap[p._id.toString()] || null;
      return pollObj;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error loading polls" });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    // Verify Ownership
    if (poll.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own polls" });
    }

    await Poll.findByIdAndDelete(req.params.id);
    await Vote.deleteMany({ poll: req.params.id }); // Clean up votes

    res.json({ message: "Poll deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.votePoll = async (req, res) => {
  const { option } = req.body;
  const poll = await Poll.findById(req.params.id);

  if (!poll) return res.status(404).json({ message: "Poll not found" });

  if (poll.expiresAt && poll.expiresAt < new Date()) {
    return res.status(400).json({ message: "Poll has expired" });
  }

  const alreadyVoted = await Vote.findOne({ poll: poll._id, user: req.user._id });
  if (alreadyVoted) return res.status(400).json({ message: "Already voted" });

  const selected = poll.options.find(o => o.text === option);
  if (!selected) return res.status(400).json({ message: "Invalid option" });

  selected.votes += 1;
  await poll.save();

  await Vote.create({
    poll: poll._id,
    user: req.user._id,
    selectedOption: option
  });

  const updatedPoll = await Poll.findById(poll._id);
  req.app.get("io").emit("pollUpdated", updatedPoll);

  res.json({ message: "Vote recorded", poll: updatedPoll });
};