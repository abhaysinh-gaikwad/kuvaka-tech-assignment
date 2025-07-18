const express = require("express");
const router = express.Router();
const {
  subscribePro,
  stripeWebhook,
  getSubscriptionStatus
} = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/pro", authMiddleware, subscribePro);
router.post("/stripe", stripeWebhook);
router.get("/status", authMiddleware, getSubscriptionStatus);

module.exports = router;
