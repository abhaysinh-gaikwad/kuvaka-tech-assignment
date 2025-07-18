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
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error.message);
    res.status(500).json({ error: "Checkout failed" });
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
        return res.status(400).json({ error: "Missing userId" });
      }
      await pool.query(
        "UPDATE users SET subscription_tier = $1 WHERE id = $2",
        ["pro", userId]
      );
      console.log(`Updated user ${userId} to Pro tier`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(400).json({ error: "Webhook failed" });
  }
};
