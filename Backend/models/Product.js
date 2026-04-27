const mongoose = require('mongoose');

// ================= REVIEW SCHEMA =================
const reviewSchema = new mongoose.Schema({
  user: {
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
  comment: {
    type: String,
    required: true
  },
  sentiment: {
    type: String, // Positive / Negative / Neutral (AI)
    default: "Neutral"
  }
}, { timestamps: true });


// ================= PRODUCT SCHEMA =================
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  features: [String],

  brand: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  // ✅ external links
  amazonLink: {
    type: String
  },
  flipkartLink: {
    type: String
  },
  officialLink: {
    type: String
  },

  // ✅ multiple images support
  images: [
    {
      url: String,
      public_id: String
    }
  ],

  stock: {
    type: Number,
    default: 0
  },

  ratings: {
    type: Number,
    default: 0
  },

  numOfReviews: {
    type: Number,
    default: 0
  },

  smartScore: {
    type: Number,
    default: 0
  },


  reviews: [reviewSchema],

  tags: [String],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});


// 🔍 Text search (AI search support)
productSchema.index({
  name: 'text',
  description: 'text',
  tags: 'text'
});


// ================= EXPORT =================
module.exports = mongoose.model('Product', productSchema);