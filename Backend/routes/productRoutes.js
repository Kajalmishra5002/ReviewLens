const express = require('express');
const router = express.Router();
const { getProducts, getProductById, compareProducts, getBestProducts, getTrendingProducts, searchProducts } = require('../controllers/productController');
const { addReview } = require('../controllers/reviewController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/best', getBestProducts);
router.get('/trending/list', getTrendingProducts);
router.get('/compare', compareProducts);
router.get('/:id', getProductById);
router.post('/:id/review', isAuthenticated, addReview);

module.exports = router;

