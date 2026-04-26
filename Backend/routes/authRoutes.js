const express = require('express');

const {
  forgotPassword,
  getUser,
  login,
  logout,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
  verifyEmail
} = require('../Controllers/authController');

const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

// ✅ Auth routes
router.post('/register', register);
router.post('/login', login);

router.get('/me', isAuthenticated, getUser);
router.get('/logout', isAuthenticated, logout);
router.get('/verify/:token', verifyEmail);

// ✅ Password routes
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticated, updatePassword);

// ✅ Profile update
router.put('/profile/update', isAuthenticated, updateProfile);

module.exports = router;
