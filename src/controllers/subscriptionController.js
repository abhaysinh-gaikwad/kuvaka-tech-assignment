const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const subscribePro = async (req, res) => {
  const userId = req.user.userId;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      client_reference_id: userId.toString(),
    });
    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const userId = event.data.object.client_reference_id;
      await pool.query('UPDATE users SET subscription_tier = $1 WHERE id = $2', ['pro', userId]);
    }
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await pool.query('SELECT subscription_tier FROM users WHERE id = $1', [userId]);
    res.status(200).json({ subscriptionTier: user.rows[0].subscription_tier });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { subscribePro, stripeWebhook, getSubscriptionStatus };
