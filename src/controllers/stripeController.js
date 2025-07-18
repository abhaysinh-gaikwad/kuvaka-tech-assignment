const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../config/db");

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId.toString()
    });
    res.json({
      success: true,
      data: { url: session.url },
      message: "Checkout session created successfully"
    });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error creating checkout session"
    });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log("Stripe Webhook Received");
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Webhook event type:", event.type);
    if (event.type === "checkout.session.completed") {
      const userId = event.data.object.client_reference_id;
      if (!userId) {
        console.error("No client_reference_id in webhook event");
        return res.status(400).json({
          success: false,
          message: "Missing userId in webhook event"
        });
      }
      await pool.query(
        "UPDATE users SET subscription_tier = $1 WHERE id = $2",
        ["pro", userId]
      );
      console.log(`Updated user ${userId} to Pro tier`);
      res.json({
        success: true,
        data: { received: true },
        message: "Webhook processed successfully"
      });
    } else {
      res.json({
        success: true,
        data: { received: true },
        message: `Webhook event ${event.type} received but not processed`
      });
    }
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).json({
      success: false,
      message: "Webhook processing failed"
    });
  }
};
