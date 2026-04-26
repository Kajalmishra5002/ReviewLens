const express = require('express');

const {
  createProduct,
  fetchAllProducts,
  updateProduct,
  deleteProduct,
  fetchSingleProduct,
  postProductReview,
  deleteReview,
  fetchAIFilteredProducts,
  getBestProducts,
  analyzeReview,
  compareProducts,
  fetchSearchProducts
} = require('../controllers/productController');

const {
  authorizedRoles,
  isAuthenticated
} = require('../middlewares/authMiddleware');

const router = express.Router();


// ================= ADMIN =================

// ✅ Create product (Admin / Setup)
router.post(
  '/admin/create',
  isAuthenticated,
  authorizedRoles('Admin'),
  createProduct
);

// ✅ Add product (Seller / Admin)
router.post(
  '/add',
  isAuthenticated,
  authorizedRoles('Seller', 'Admin'),
  createProduct
);

// ✅ Update product
router.put(
  '/admin/update/:productId',
  isAuthenticated,
  authorizedRoles('Admin'),
  updateProduct
);

// ✅ Delete product
router.delete(
  '/admin/delete/:productId',
  isAuthenticated,
  authorizedRoles('Admin'),
  deleteProduct
);


// ================= PUBLIC =================

// ✅ All products
router.get('/', fetchAllProducts);

// 🔍 SEARCH PRODUCTS
router.get('/search', fetchSearchProducts);

// ⭐ Best products
router.get('/best', getBestProducts);


// ⚔️ Compare products 🔥
router.get('/compare/:id1/:id2', compareProducts);

// ✅ Single product
router.get('/:productId', fetchSingleProduct);


// ================= REVIEWS =================

// ✅ Add / update review
router.put(
  '/post-new/review/:productId',
  isAuthenticated,
  postProductReview
);

// ✅ Delete review
router.delete(
  '/delete/review/:productId',
  isAuthenticated,
  deleteReview
);


// ================= AI FEATURES =================

// 🤖 AI search
router.post(
  '/ai-search',
  isAuthenticated,
  fetchAIFilteredProducts
);

// 🤖 Sentiment analysis
router.post(
  '/analyze-review',
  isAuthenticated,
  analyzeReview
);


module.exports = router;
