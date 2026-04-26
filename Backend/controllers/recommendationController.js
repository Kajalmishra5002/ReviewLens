const axios = require('axios');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/recommend`,
      {
        user_id: req.params.userId,
        purchase_history: user.purchaseHistory || [],
      }
    );

    const productIds = aiRes.data.recommended_ids || [];

    const recommendations = await Product.find({
      _id: { $in: productIds },
    });

    res.json({ success: true, recommendations });

  } catch (err) {
    console.log(err.message);

    const fallback = await Product.find()
      .sort({ ratings: -1 })
      .limit(4);

    res.json({
      success: true,
      message: 'Fallback recommendations',
      recommendations: fallback,
    });
  }
};