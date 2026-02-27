const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const { verifyOfficial } = require("../controllers/adminController");

const router = express.Router();

router.put(
  "/verify/:id",
  protect,
  authorize("admin"),
  verifyOfficial
);

module.exports = router;
