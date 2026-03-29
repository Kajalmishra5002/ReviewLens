const router = require('express').Router();
const axios = require('axios');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products with AI recommendations
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    const products = await Product.find(query)
      .populate('vendor', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get recommendations for a user
router.get('/recommendations/:userId', auth, async (req, res) => {
  try {
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/recommend`, {
      user_id: req.params.userId
    });
    const products = await Product.find({ _id: { $in: data.product_ids } });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create product (vendor only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'vendor') return res.status(403).json({ error: 'Vendors only' });
    const product = await Product.create({ ...req.body, vendor: req.user.id });

    // Get initial dynamic price from AI
    const { data } = await axios.post(`${process.env.AI_SERVICE_URL}/dynamic-price`, {
      product_id: product._id.toString(),
      base_price: product.price,
      category: product.category
    });
    product.dynamicPrice = data.dynamic_price;
    await product.save();
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;