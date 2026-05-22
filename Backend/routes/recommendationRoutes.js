const express = require('express');
const router = express.Router();

const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');
const { getRecommendations } = require('../controllers/recommendationController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// ✅ Only ONE route
router.get('/:userId', isAuthenticated, getRecommendations);
// ✅ Get AI-based recommendations
router.get('/:userId', isAuthenticated, async (req, res) => {
  try {
    // 🔍 Find user
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🤖 Call AI service
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/recommend`,
      {
        user_id: req.params.userId,
        purchase_history: user.purchaseHistory || [],
      }
    );

    const productIds = aiRes.data.recommended_ids || [];

    // 🛒 Fetch recommended products
    const recommendations = await Product.find({
      _id: { $in: productIds },
    });

    return res.json({ success: true, recommendations });

  } catch (err) {
    console.error('AI Recommendation Error:', err.message);

    try {
      // 🔁 Fallback: top-rated products
      const fallback = await Product.find()
        .sort({ ratings: -1 })
        .limit(4);

      return res.json({
        success: true,
        message: 'Fallback recommendations',
        recommendations: fallback,
      });

    } catch (fallbackErr) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
      });
    }
  }
});

module.exports = router;