const express = require("express");

const {
  getCurrentUser,
  getUserActivity,
  uploadAvatar,
} = require("../controllers/userController");


const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

/* GET USER PROFILE */
router.get("/me", protect, getCurrentUser);

/* GET USER ACTIVITY */
router.get("/activity", protect, getUserActivity);

/* UPLOAD AVATAR */
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;