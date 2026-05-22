const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please add a category']
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    description: {
        type: String,
        default: ''
    },
    rating: {
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
    aiInsights: {
        summary: { type: String, default: 'No insights available yet.' },
        positiveHighlights: [String],
        negativeHighlights: [String],
        lastGenerated: { type: Date, default: Date.now }
    },
    features: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    images: [
        {
            url: { type: String, required: true }
        }
    ],
    avgRating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User'
            },
            name: {
                type: String
            },
            rating: {
                type: Number,
                required: true
            },
            text: {
                type: String,
                required: true
            },
            sentiment: {
                type: String,
                enum: ['Positive', 'Neutral', 'Negative'],
                default: 'Neutral'
            },
            isFake: {
                type: Boolean,
                default: false
            },
            isSuspicious: {
                type: Boolean,
                default: false
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    amazonLink: {
        type: String,
        default: ''
    },
    flipkartLink: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

