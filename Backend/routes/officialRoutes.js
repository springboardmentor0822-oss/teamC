const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const { getOfficialPetitions, getOfficialsList } = require("../controllers/officialController");

router.get(
    "/petitions", 
    protect, 
    authorize("official"), 
    getOfficialPetitions
);

router.get("/test", (req, res) => {
  res.json({ message: "Official route working" });
});

router.get("/list",protect, getOfficialsList);

module.exports = router;