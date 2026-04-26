const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  type: {
    type: String,
    enum: ['view', 'purchase', 'wishlist', 'review'],
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5
  },

  score: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });


// ================= AUTO SCORE CALCULATION =================
interactionSchema.pre('save', function (next) {

  switch (this.type) {
    case 'view':
      this.score = 1;
      break;
    case 'wishlist':
      this.score = 2;
      break;
    case 'review':
      this.score = this.rating ? this.rating : 3;
      break;
    case 'purchase':
      this.score = 5;
      break;
    default:
      this.score = 0;
  }

  next();
});


// ================= INDEX (PERFORMANCE BOOST) =================
interactionSchema.index({ user: 1, product: 1 });
interactionSchema.index({ type: 1 });


// ================= EXPORT =================
module.exports = mongoose.model('Interaction', interactionSchema);