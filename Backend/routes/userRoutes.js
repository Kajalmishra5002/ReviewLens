const express = require('express');
const router = express.Router();
const { 
    registerUser, 
    loginUser, 
    googleLogin,
    getUserProfile, 
    updateUserProfile 
} = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// Protected Routes
router.get('/profile', isAuthenticated, getUserProfile);
router.put('/profile', isAuthenticated, updateUserProfile);

module.exports = router;
