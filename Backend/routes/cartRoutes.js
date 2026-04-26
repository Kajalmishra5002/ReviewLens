const express = require('express');
const router = express.Router();
const { getCart, addToCart } = require('../controllers/cartController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.route('/')
  .get(isAuthenticated, getCart);

router.route('/add')
  .post(isAuthenticated, addToCart);

module.exports = router;
