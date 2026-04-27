const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// GET /api/users/profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    const { name, email, phone, city, gender, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, mobileNumber: phone, city, gender, addresses },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/user/:id (actually handled by orderRoutes, but adding here just in case, though orderRoutes should already exist)

module.exports = router;
