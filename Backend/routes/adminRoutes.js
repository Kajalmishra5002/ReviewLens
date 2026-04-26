const express = require('express');

const {
  getAllUsers,
  deleteUser,
  dashboardStats,
  advancedDashboard
} = require('../controllers/adminController');

const {
  authorizedRoles,
  isAuthenticated
} = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Get all users (Admin only)
router.get(
  '/getallusers',
  isAuthenticated,
  authorizedRoles('Admin'),
  getAllUsers
);

// ✅ Delete user (Admin only)
router.delete(
  '/delete/:id',
  isAuthenticated,
  authorizedRoles('Admin'),
  deleteUser
);

// ✅ Dashboard stats (Admin only)
router.get(
  '/fetch/dashboard-stats',
  isAuthenticated,
  authorizedRoles('Admin'),
  dashboardStats
);

router.get(
  '/analytics',
  isAuthenticated,
  authorizedRoles('Admin'),
  advancedDashboard
);
module.exports = router;
