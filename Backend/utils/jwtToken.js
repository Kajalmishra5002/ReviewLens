const jwt = require('jsonwebtoken');

const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(statusCode).json({
    success: true,
    message,
    token,
    user
  });
};

module.exports = sendToken;