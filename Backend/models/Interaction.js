const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  type: { type: String, enum: ['view', 'purchase', 'wishlist', 'review'] },
  rating: Number,  // for review type
  score: Number    // computed interaction score
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);