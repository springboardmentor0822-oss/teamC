const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/authMiddleware");
const { getStats, getOfficialStats } = require("../controllers/dashboardController");

router.get("/", protect, getStats);

router.get(
    "/official",
    protect,
    authorize("official"),
    getOfficialStats
);

module.exports = router;