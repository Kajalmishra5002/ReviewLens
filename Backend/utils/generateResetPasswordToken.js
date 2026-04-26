const crypto = require('crypto');

const generateResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(20).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const resetPasswordExpireTime = Date.now() + 15 * 60 * 1000; // 15 min

  return {
    resetToken,
    hashedToken,
    resetPasswordExpireTime
  };
};

module.exports = generateResetPasswordToken;