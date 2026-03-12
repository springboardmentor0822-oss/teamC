const express = require("express");
const router = express.Router();

const {
  createPoll,
  getPolls,
  votePoll,
  deletePoll // Import the new delete function
} = require("../controllers/pollController");

const { protect } = require("../middleware/authMiddleware");

// Create a new poll
router.post("/", protect, createPoll);

// Get all polls for user's location
router.get("/", protect, getPolls);

// Vote on a specific poll
router.post("/:id/vote", protect, votePoll);

// Delete a poll (Only creator)
// Changed 'authMiddleware' to 'protect' to match your import
router.delete('/:id', protect, deletePoll); 

module.exports = router;