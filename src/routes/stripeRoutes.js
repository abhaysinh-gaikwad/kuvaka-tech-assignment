const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripeController");
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../config/db");

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
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      data: { subscriptionTier: user.rows[0].subscription_tier },
      message: "Subscription status retrieved successfully"
    });
  } catch (error) {
    console.error("Subscription status error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving subscription status"
    });
  }
});

module.exports = router;
