const express = require("express");
const router = express.Router();

const { getGlobalReports } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

router.get("/global", protect, getGlobalReports);

module.exports = router;