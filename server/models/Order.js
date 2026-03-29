const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: { type: String, enum: ['pending','confirmed','shipped','delivered','cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  paymentMethod: String,
  shippingAddress: { street: String, city: String, state: String, zip: String },
  fraudScore: Number,             // AI fraud detection score
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);