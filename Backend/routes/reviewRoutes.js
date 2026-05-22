const express = require('express');
const router = express.Router();
const { getProductReviews, addReview } = require('../controllers/reviewController');

router.get('/:productId', getProductReviews);
router.post('/', addReview);
router.post('/add', addReview);


module.exports = router;
