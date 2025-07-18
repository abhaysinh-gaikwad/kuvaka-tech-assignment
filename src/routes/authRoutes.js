const express = require("express");
const router = express.Router();
const {
  signup,
  sendOTP,
  verifyOTP,
  forgotPassword,
  changePassword,
  getUser
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/signup", signup);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, getUser);

module.exports = router;
