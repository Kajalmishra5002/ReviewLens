const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true })

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: String,
  stock: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [String],
}, { timestamps: true })

productSchema.index({ name: 'text', description: 'text', tags: 'text' })

module.exports = mongoose.model('Product', productSchema)