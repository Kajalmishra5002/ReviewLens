const mongoose = require('mongoose');

// ================= ORDER ITEM =================
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  quantity: Number,
  price: Number
});


// ================= ORDER SCHEMA =================
const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  orderItems: [orderItemSchema], // ✅ FIXED

  shippingInfo: {
    address: String,
    city: String,
    state: String,
    country: String,
    pincode: String,
    phone: String
  },

  paymentInfo: {
    id: String,
    status: String
  },

  itemsPrice: {
    type: Number,
    required: true
  },

  taxPrice: {
    type: Number,
    default: 0
  },

  shippingPrice: {
    type: Number,
    default: 0
  },

  totalPrice: {
    type: Number,
    required: true
  },

  isPaid: {
    type: Boolean,
    default: false
  },

  paidAt: Date,

  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});


// ================= EXPORT =================
module.exports = mongoose.model('Order', orderSchema);