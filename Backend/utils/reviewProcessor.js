const axios = require('axios');
const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * Core logic to process a single review (Sentiment + Fake Detection)
 */
const processReview = async ({ productId, userId, name, text, rating }) => {
  try {
    // 1. Basic Cleaning
    const cleanText = text.trim();
    
    // 2. Call AI Service for Sentiment & AI Fake Score
    let sentiment = 'Neutral';
    let aiFakeScore = 0;
    
    try {
      const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, { 
        text: cleanText,
        rating: Number(rating)
      }, { timeout: 3000 });
      
      if (response.data) {
        sentiment = response.data.sentiment || 'Neutral';
        aiFakeScore = response.data.fake_score || 0;
      }
    } catch (err) {
      console.warn("AI Service error in batch processing, falling back.");
    }

    // 3. Multi-layer Fake Detection
    let isFake = aiFakeScore >= 50;
    let fakeScore = aiFakeScore;

    // Layer: Duplicate Text
    const duplicate = await Review.findOne({ 
      productId, 
      reviewText: { $regex: new RegExp("^" + cleanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") } 
    });
    if (duplicate) { isFake = true; fakeScore += 100; }

    // Layer: Sentiment Mismatch (Manual Layer)
    if ((rating >= 4 && sentiment === 'Negative') || (rating <= 2 && sentiment === 'Positive')) {
      isFake = true; fakeScore += 60;
    }

    if (fakeScore >= 50) isFake = true;

    // 4. Save to DB
    const review = await Review.create({
      productId,
      userId,
      name: name || "Verified Buyer",
      rating: Number(rating),
      reviewText: cleanText,
      sentiment,
      isFake,
      fakeScore,
      isSuspicious: isFake
    });

    // 5. Sync with Product Stats
    const product = await Product.findById(productId);
    if (product) {
      const allReviews = await Review.find({ productId });
      
      product.reviews = allReviews.map(r => ({
        _id: r._id,
        user: r.userId,
        name: r.name,
        rating: r.rating,
        text: r.reviewText,
        sentiment: r.sentiment,
        isFake: r.isFake,
        isSuspicious: r.isSuspicious,
        createdAt: r.createdAt
      }));

      product.numReviews = allReviews.length;
      product.avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      
      // Sync smartScore (Simple fallback for batch)
      const posCount = allReviews.filter(r => r.sentiment === 'Positive').length;
      const fakeCount = allReviews.filter(r => r.isFake).length;
      product.smartScore = Math.round(((posCount/allReviews.length)*60) + (product.avgRating*8) - (fakeCount/allReviews.length)*20);

      await product.save();
    }

    return review;
  } catch (error) {
    console.error("Error processing review:", error.message);
    throw error;
  }
};

module.exports = { processReview };
