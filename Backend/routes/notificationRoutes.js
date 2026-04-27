const express = require('express');
const { getUserNotifications, markAsRead } = require('../controllers/notificationController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/my', isAuthenticated, getUserNotifications);
router.put('/:id/read', isAuthenticated, markAsRead);

module.exports = router;
