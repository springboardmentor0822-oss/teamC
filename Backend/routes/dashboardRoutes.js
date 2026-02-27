const express = require("express");
const router = express.Router();

const { getStats, getOfficialStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getStats);
router.get("/officials", protect, getOfficialStats);

module.exports = router;