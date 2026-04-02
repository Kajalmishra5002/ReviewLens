const router = require('express').Router()
const Product = require('../models/Product')
const auth = require('../middleware/auth')

// Get all products with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query
    const query = {}
    if (search) query.$text = { $search: search }
    if (category) query.category = category
    if (minPrice || maxPrice) query.price = {}
    if (minPrice) query.price.$gte = Number(minPrice)
    if (maxPrice) query.price.$lte = Number(maxPrice)

    const products = await Product.find(query)
      .skip((page - 1) * limit).limit(Number(limit))
    const total = await Product.countDocuments(query)
    res.json({ products, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name')
    if (!product) return res.status(404).json({ message: 'Not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Add review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    const { rating, comment } = req.body
    product.reviews.push({ user: req.user.id, rating, comment })
    product.ratings = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    await product.save()
    res.status(201).json({ message: 'Review added' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Admin: create product
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router