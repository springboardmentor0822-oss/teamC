const express = require("express");
const router = express.Router();


const {
  createPetition,
  getPetitions,
  signPetition,
  respondToPetition,
  getMyPetitions,
  deletePetition,
  updatePetition,
  getPetitionById,
} = require("../controllers/petitionController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/dashboardController");

// Create petition (citizen only)
router.post(
  "/",
  protect,
  authorize("citizen"),
  createPetition
);

// Get all petitions (public)
router.get("/", protect, getPetitions);

// Sign petition (citizen only)
router.post(
  "/:id/sign",
  protect,
  authorize("citizen"),
  signPetition
);

// Official respond (official only)
router.post(
  "/:id/respond",
  protect,
  authorize("official"),
  respondToPetition
);

router.get(
  "/my",
  protect,
  authorize("citizen", "official"),
  getMyPetitions
);
router.get("/:id", protect, getPetitionById);

router.delete(
  "/:id",
  protect,
  authorize("citizen"),
  deletePetition
);

router.put("/:id", protect, updatePetition);

module.exports = router;
