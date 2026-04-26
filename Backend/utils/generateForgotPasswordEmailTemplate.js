const generateEmailTemplate = (resetUrl) => {
  return `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;
};

module.exports = generateEmailTemplate;