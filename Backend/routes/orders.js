const router = require('express').Router()
const Order = require('../models/Order')
const User = require('../models/User')
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body
    const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0)
    const order = await Order.create({
      user: req.user.id, items, totalAmount, shippingAddress, paymentMethod
    })
    // Track purchase history for AI recommendations
    const productIds = items.map(i => i.product)
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { purchaseHistory: { $each: productIds } }
    })
    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name image price')
      .sort('-createdAt')
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router