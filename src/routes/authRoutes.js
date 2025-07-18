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
const validate = require("../middleware/validationMiddleware");
const {
  signupSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  changePasswordSchema
} = require("../validators/authValidators");

router.post("/signup", validate(signupSchema), signup);
router.post("/send-otp", validate(sendOTPSchema), sendOTP);
router.post("/verify-otp", validate(verifyOTPSchema), verifyOTP);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post(
  "/change-password",
  authMiddleware,
  validate(changePasswordSchema),
  changePassword
);
router.get("/me", authMiddleware, getUser);

module.exports = router;
