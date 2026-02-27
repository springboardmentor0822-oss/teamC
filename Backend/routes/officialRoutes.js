const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getOfficialPetitions } = require("../controllers/officialController");

router.get(
    "/petitions", 
    protect, 
    authorize("official"), 
    getOfficialPetitions
);

router.get("/test", (req, res) => {
  res.json({ message: "Official route working" });
});

module.exports = router;