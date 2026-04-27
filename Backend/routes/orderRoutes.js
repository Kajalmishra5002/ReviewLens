const express = require('express');
const router = express.Router();

const {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');

const {
  isAuthenticated,
  authorizedRoles
} = require('../middlewares/authMiddleware');

// ================= NEW ROUTES ADDED BY REQUEST =================
router.post('/', isAuthenticated, placeNewOrder);
router.get('/my', isAuthenticated, fetchMyOrders);
// ===============================================================

// ✅ Create new order
router.post('/new', isAuthenticated, placeNewOrder);

// ✅ Get logged-in user's orders
router.get('/orders/me', isAuthenticated, fetchMyOrders);

// ✅ Get seller's orders
router.get(
  '/seller/:id',
  isAuthenticated,
  authorizedRoles('Seller', 'Admin'),
  require('../controllers/orderController').getSellerOrders
);

// ✅ Get single order
// Important: This route catches /my and /:orderId so we put it carefully.
router.get('/:orderId', isAuthenticated, fetchSingleOrder);

// ✅ Admin: get all orders
router.get(
  '/admin/getall',
  isAuthenticated,
  authorizedRoles('Admin'),
  fetchAllOrders
);

// ✅ Admin: update order status
router.put(
  '/admin/update/:orderId',
  isAuthenticated,
  authorizedRoles('Admin'),
  updateOrderStatus
);

// ✅ Admin: delete order
router.delete(
  '/admin/delete/:orderId',
  isAuthenticated,
  authorizedRoles('Admin'),
  deleteOrder
);

module.exports = router;
