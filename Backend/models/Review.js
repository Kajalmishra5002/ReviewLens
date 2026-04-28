const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  reviewText: {
    type: String,
    required: true
  },

  sentiment: {
    type: String,
    default: "Neutral" // AI calculated
  },

  isSuspicious: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Review', reviewSchema);