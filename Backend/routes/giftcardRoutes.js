const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCard');

// POST /api/giftcard/verify
router.post('/verify', async (req, res) => {
  try {
    const { voucherCode, password } = req.body;

    if (!voucherCode || !password) {
      return res.status(400).json({ error: 'Voucher code and password are required' });
    }

    const giftCard = await GiftCard.findOne({ voucherCode });

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    if (giftCard.password !== password) {
      return res.status(401).json({ error: 'Invalid gift card password' });
    }

    if (giftCard.isUsed) {
      return res.status(400).json({ error: 'Gift card has already been used' });
    }

    res.json({
      success: true,
      giftCardId: giftCard._id,
      amount: giftCard.amount,
      message: 'Gift card applied successfully'
    });
  } catch (err) {
    console.error("Gift Card Verify Error:", err);
    res.status(500).json({ error: 'Server error verifying gift card' });
  }
});

module.exports = router;
