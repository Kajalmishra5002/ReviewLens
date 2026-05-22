const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

// Step 1 — Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Razorpay keys are missing in backend" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: receipt || `receipt_${Math.floor(Math.random() * 100000)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error("Razorpay Create Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const GiftCard = require('../models/GiftCard');

// Step 2 — Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, giftCardId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Optional: Mark order as paid if orderId was passed (like in Cart checkout)
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        status: 'processing',
        paymentResult: { id: razorpay_payment_id, status: 'paid' }
      });
    }

    // Mark gift card as used if passed
    if (giftCardId) {
      await GiftCard.findByIdAndUpdate(giftCardId, { isUsed: true });
    }

    res.json({ success: true, message: 'Payment verified successfully!' });
  } catch (err) {
    console.error("Razorpay Verify Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;