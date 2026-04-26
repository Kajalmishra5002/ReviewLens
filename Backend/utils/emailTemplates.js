exports.welcomeEmailTemplate = (name) => `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #FF6B00;">Welcome to ReviewLens, ${name}!</h2>
  <p>We're thrilled to have you here. Start exploring top products, discovering detailed analysis, and finding the best deals across the web.</p>
  <br />
  <p>Cheers,</p>
  <p><strong>The ReviewLens Team</strong></p>
</div>
`;

exports.verificationEmailTemplate = (name, resetUrl) => `
<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
  <h2 style="color: #FF6B00;">Verify Your Email</h2>
  <p>Hi ${name},</p>
  <p>Welcome to ReviewLens! To complete your signup and access your portal, please click the button below to verify your email address. This link is valid for 24 hours.</p>
  <br />
  <a href="${resetUrl}" style="background-color: #FF6B00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
  <br /><br />
  <p>If you did not create an account, please ignore this email.</p>
  <br />
  <p>Thanks,</p>
  <p><strong>The ReviewLens Team</strong></p>
</div>
`;

exports.orderConfirmationTemplate = (name, orderId, amount, items) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity} x ₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);
  const deliveryDateString = estimatedDelivery.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
    <h2 style="color: #FF6B00;">Order Confirmation</h2>
    <p>Hi ${name},</p>
    <p>Thank you for shopping with ReviewLens!</p>
    <p>Your order <strong>#${orderId}</strong> for <strong>₹${amount.toLocaleString('en-IN')}</strong> has been successfully placed.</p>
    <br />
    <h3 style="color: #FF6B00; border-bottom: 1px solid #FF6B00; padding-bottom: 5px;">Order Summary</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${itemsHtml}
    </table>
    <br />
    <p><strong>Estimated Delivery:</strong> ${deliveryDateString}</p>
    <br />
    <p>You can track your order status in your Profile dashboard.</p>
    <br />
    <p>Thanks,</p>
    <p><strong>The ReviewLens Team</strong></p>
  </div>
  `;
};
