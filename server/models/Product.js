const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  dynamicPrice: Number,           // AI-updated price
  category: { type: String, required: true },
  tags: [String],
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  stock: { type: Number, default: 0 },
  images: [String],
  ratings: [{ user: mongoose.Schema.Types.ObjectId, score: Number }],
  avgRating: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  purchases: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', ProductSchema);