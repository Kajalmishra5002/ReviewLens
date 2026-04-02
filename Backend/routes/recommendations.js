const router = require('express').Router()
const axios = require('axios')
const User = require('../models/User')
const Product = require('../models/Product')
const auth = require('../middleware/auth')

router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Call Python AI service
    const aiRes = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
      user_id: req.params.userId,
      purchase_history: user.purchaseHistory,
    })

    const productIds = aiRes.data.recommended_ids
    const recommendations = await Product.find({ _id: { $in: productIds } })
    res.json({ recommendations })
  } catch (err) {
    // Fallback: return popular products
    const fallback = await Product.find().sort('-ratings').limit(4)
    res.json({ recommendations: fallback })
  }
})

module.exports = router