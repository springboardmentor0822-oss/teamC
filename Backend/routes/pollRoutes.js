const express = require("express");
const router = express.Router();

const {
  createPoll,
  getPolls,
  votePoll
} = require("../controllers/pollController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPoll);

router.get("/", protect, getPolls);

router.post("/:id/vote", protect, votePoll);

module.exports = router;