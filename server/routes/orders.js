const router = require('express').Router();
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Place order with fraud detection
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethodId } = req.body;

    // 1. Calculate total
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // 2. AI Fraud Detection
    const fraudRes = await axios.post(`${process.env.AI_SERVICE_URL}/fraud-detect`, {
      user_id: req.user.id,
      amount: totalAmount,
      items,
      shipping_address: shippingAddress
    });
    const fraudScore = fraudRes.data.fraud_score;
    if (fraudScore > 0.85) return res.status(403).json({ error: 'Order flagged as suspicious' });

    // 3. Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true
    });

    // 4. Create order
    const order = await Order.create({
      customer: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      fraudScore,
      paymentStatus: paymentIntent.status === 'succeeded' ? 'paid' : 'pending',
      paymentMethod: 'stripe'
    });
    res.status(201).json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;