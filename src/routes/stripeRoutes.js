const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");
const pool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/subscribe/pro",
  authMiddleware,
  stripeController.createCheckoutSession
);
router.post("/webhook/stripe", stripeController.handleWebhook);
router.get("/subscription/status", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT subscription_tier FROM users WHERE id = $1",
      [req.user.userId]
    );
    res.status(200).json({ subscriptionTier: user.rows[0].subscription_tier });
  } catch (error) {
    console.error("Subscription status error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
