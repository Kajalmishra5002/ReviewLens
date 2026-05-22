const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Check authentication
const isAuthenticated = async (req, res, next) => {
  try {
    let token;

    // 👉 Token from cookies OR headers
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Please login to access this resource'
      });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Get user from DB (MongoDB)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token has expired, please login again' : 'Invalid token, please login again'
    });
  }
};

// ✅ Role-based access
const authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user.role}) is not allowed`
      });
    }
    next();
  };
};

module.exports = {
  isAuthenticated,
  authorizedRoles
};