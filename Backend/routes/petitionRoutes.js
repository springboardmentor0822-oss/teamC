const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createPetition,
  getPetitions,
  signPetition,
  respondToPetition,
} = require("../controllers/petitionController");

const router = express.Router();

// Create petition (citizen only)
router.post("/", protect, authorize("citizen"), createPetition);

// Get all petitions (public)
router.get("/", getPetitions);

// Sign petition (citizen only)
router.post("/:id/sign", protect, authorize("citizen"), signPetition);

// Official respond to petition
router.post("/:id/respond", protect, authorize("official"), respondToPetition);

module.exports = router;
