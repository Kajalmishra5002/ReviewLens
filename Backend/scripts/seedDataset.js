const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const Review = require('../models/Review');
const { analyzeSentiment } = require('../utils/sentiment');
const { detectFakeReview } = require('../services/fakeReviewDetector');

const SEED_DATA_PATH = path.join(__dirname, '..', 'data', 'products_dataset.json');

const seedDataset = async () => {
    try {
        console.log("🚀 Starting Seeding Process...");
        
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");

        // 2. Clear Existing Data (Ensures a fresh start)
        await Product.deleteMany({});
        await Review.deleteMany({});
        console.log("🧹 Collections cleared");

        // 3. Read Dataset
        if (!fs.existsSync(SEED_DATA_PATH)) {
            console.error("❌ Dataset file not found at:", SEED_DATA_PATH);
            process.exit(1);
        }
        const productsData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf-8'));
        console.log(`📦 Loaded ${productsData.length} products from dataset`);

        for (const pData of productsData) {
            console.log(`🔍 Processing Product: ${pData.name}`);

            // Create Product in DB
            const product = new Product({
                name: pData.name,
                category: pData.category,
                brand: pData.brand,
                price: pData.price,
                description: pData.description,
                features: pData.features,
                images: [{ url: pData.image, public_id: `seed_${Date.now()}` }],
                amazonLink: pData.amazonLink,
                flipkartLink: pData.flipkartLink,
                createdBy: "662f9a123456789012345678" // Mock Admin ID or use a real one
            });

            const savedProduct = await product.save();
            const processedReviews = [];

            // Process Reviews with AI
            for (const rData of pData.reviews) {
                // Sentiment
                const { sentiment, confidence } = await analyzeSentiment(rData.reviewText || rData.comment);
                
                // Fake Detection (using already processed reviews for context similarity)
                const { isFake, fakeScore } = detectFakeReview(
                    rData.reviewText || rData.comment, 
                    rData.rating, 
                    processedReviews
                );

                const review = new Review({
                    productId: savedProduct._id,
                    userId: "662f9a123456789012345678", // Mock User
                    name: rData.userName,
                    rating: rData.rating,
                    reviewText: rData.reviewText || rData.comment,
                    sentiment,
                    confidenceScore: confidence,
                    isFake,
                    fakeScore,
                    createdAt: rData.createdAt
                });

                const savedReview = await review.save();
                processedReviews.push(savedReview);

                // Add to product's embedded reviews for compatibility
                savedProduct.reviews.push({
                    user: savedReview.userId,
                    name: savedReview.name,
                    rating: savedReview.rating,
                    comment: savedReview.reviewText,
                    sentiment: savedReview.sentiment,
                    isFake: savedReview.isFake,
                    fakeScore: savedReview.fakeScore,
                    createdAt: savedReview.createdAt
                });
            }

            // Calculate Product Stats
            savedProduct.totalReviews = processedReviews.length;
            savedProduct.numOfReviews = processedReviews.length;
            savedProduct.positiveReviews = processedReviews.filter(r => r.sentiment === 'Positive').length;
            savedProduct.negativeReviews = processedReviews.filter(r => r.sentiment === 'Negative').length;
            savedProduct.neutralReviews = processedReviews.filter(r => r.sentiment === 'Neutral').length;
            savedProduct.fakeReviewCount = processedReviews.filter(r => r.isFake).length;
            
            const totalRating = processedReviews.reduce((acc, r) => acc + r.rating, 0);
            savedProduct.avgRating = Number((totalRating / processedReviews.length).toFixed(1));
            savedProduct.ratings = savedProduct.avgRating;

            await savedProduct.save();
            console.log(`✅ Seeded ${processedReviews.length} reviews for ${pData.name}`);
        }

        console.log("✨ Seeding Completed Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding Failed:", error.message);
        process.exit(1);
    }
};

seedDataset();
