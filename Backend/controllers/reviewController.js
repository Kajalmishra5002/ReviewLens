const Review = require("../models/Review.js");
const { analyzeSentiment } = require("../utils/sentiment.js");
const { calculateSmartScore } = require("../utils/prasAlgorithm.js");
const { dummyReviews } = require("../data/dummyData");
const axios = require("axios");

exports.addReview = async (req, res) => {
  try {
    const { productId: bodyProductId, rating, text, name: bodyName } = req.body;
    const { id: paramsProductId } = req.params;

    const productId = bodyProductId || paramsProductId;
    const name = bodyName || (req.user ? req.user.name : "Anonymous");
    const userId = req.user ? req.user._id : (req.body.userId || null);

    if (!productId || !text || !rating) {
      return res.status(400).json({ success: false, message: "Missing required fields (productId, text, rating)" });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    // 🧠 AI Sentiment & Fake Score
    let sentiment = 'Neutral';
    let aiFakeScore = 0;
    let aiIsFake = false;

    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/analyze`, { 
        text, 
        rating: Number(rating) 
      }, { timeout: 5000 });
      
      sentiment = aiResponse.data.sentiment || 'Neutral';
      aiFakeScore = aiResponse.data.fake_score || 0;
      aiIsFake = aiResponse.data.is_fake || false;
    } catch (err) {
      const posWords = ['good', 'great', 'excellent', 'amazing', 'love'];
      if (text.toLowerCase().includes('good') || text.toLowerCase().includes('great')) sentiment = 'Positive';
    }

    let isFake = aiIsFake;
    let fakeScore = aiFakeScore;

    if (!global.isDBConnected) {
       // Return mock success in Demo Mode
       return res.status(201).json({ 
         success: true, 
         message: "Review submitted (DEMO MODE - Not saved)",
         review: { productId, name, rating, reviewText: text, sentiment, isFake, fakeScore, createdAt: new Date() }
       });
    }

    const duplicate = await Review.findOne({ 
      productId, 
      reviewText: { $regex: new RegExp("^" + text.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i") } 
    });
    
    if (duplicate) {
      isFake = true;
      fakeScore = 100;
    }

    const review = await Review.create({
      productId,
      userId: userId || "000000000000000000000000",
      name,
      rating: Number(rating),
      reviewText: text,
      sentiment,
      isSuspicious: isFake,
      isFake,
      fakeScore
    });

    const Product = require("../models/Product");
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
      await product.save();
      return res.status(201).json({ success: true, review, product });
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!global.isDBConnected) {
      const { dummyReviews } = require("../data/dummyData");
      return res.json({ success: true, reviews: dummyReviews.filter(r => r.productId === productId) });
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    if (reviews.length === 0) {
      const { dummyReviews } = require("../data/dummyData");
      return res.json({ success: true, reviews: dummyReviews.filter(r => r.productId === productId) });
    }

    res.json({ success: true, reviews });
  } catch (error) {
    const { dummyReviews } = require("../data/dummyData");
    res.json({ success: true, reviews: dummyReviews.filter(r => r.productId === req.params.productId) });
  }
};

exports.detectFakeReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });

    if (!reviews || reviews.length === 0) {
      return res.json({ fake_percentage: 0, flagged_review_ids: [] });
    }

    const payload = reviews.map(r => ({
      id: r._id.toString(),
      text: r.reviewText,
      user_id: r.userId.toString(),
      timestamp: r.createdAt.toISOString()
    }));

    const response = await axios.post(`${process.env.AI_SERVICE_URL}/detect-fake-reviews`, {
      reviews: payload
    });

    const { fake_percentage, flagged_review_ids } = response.data;

    // Update the database to flag these reviews
    if (flagged_review_ids && flagged_review_ids.length > 0) {
      await Review.updateMany(
        { _id: { $in: flagged_review_ids } },
        { $set: { isFake: true, isSuspicious: true } }
      );
      
      // Sync back to Product
      const Product = require("../models/Product");
      const product = await Product.findById(productId);
      if (product) {
        product.reviews.forEach(r => {
          if (flagged_review_ids.includes(r._id?.toString())) {
            r.isFake = true;
            r.isSuspicious = true;
          }
        });
        await product.save();
      }
    }


    res.json({ success: true, fake_percentage, flagged_review_ids });
  } catch (error) {
    console.error("Error detecting fake reviews:", error);
    res.status(500).json({ success: false, message: "Server Error during fake review detection" });
  }
};

exports.getProductXAIInsights = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });

    if (!reviews || reviews.length === 0) {
      return res.json({
        overallScore: 0,
        fakePercentage: 0,
        topComplaints: [],
        topPraises: []
      });
    }

    let fakeCount = 0;
    let posCount = 0;
    
    reviews.forEach(r => {
      if (r.isSuspicious) fakeCount++;
      if (r.sentiment === 'Positive') posCount++;
    });

    const fakePercentage = Math.round((fakeCount / reviews.length) * 100);
    const overallScore = Math.round((posCount / reviews.length) * 100);

    const topics = {
      battery: ["battery", "charge", "power", "mah"],
      performance: ["performance", "speed", "fast", "slow", "lag", "processor", "ram"],
      camera: ["camera", "photo", "video", "picture", "lens"],
      price: ["price", "cost", "value", "expensive", "cheap", "money", "worth"],
      screen: ["screen", "display", "bright", "color", "oled", "lcd"],
      build: ["build", "quality", "feel", "plastic", "metal", "heavy", "weight", "design"],
      sound: ["sound", "audio", "speaker", "volume", "loud", "bass"]
    };

    const complaintsCount = {};
    const praisesCount = {};

    reviews.forEach(r => {
      if (r.isSuspicious) return;

      const text = r.reviewText.toLowerCase();
      const isNegative = r.sentiment === 'Negative';
      const isPositive = r.sentiment === 'Positive';

      for (const [topic, keywords] of Object.entries(topics)) {
        if (keywords.some(kw => text.includes(kw))) {
          if (isNegative) {
            complaintsCount[topic] = (complaintsCount[topic] || 0) + 1;
          } else if (isPositive) {
            praisesCount[topic] = (praisesCount[topic] || 0) + 1;
          }
        }
      }
    });

    const formatTopics = (countsObj, totalRelevantReviews) => {
      if (totalRelevantReviews === 0) return [];
      return Object.entries(countsObj)
        .map(([topic, count]) => ({
          topic: topic.charAt(0).toUpperCase() + topic.slice(1),
          percentage: Math.round((count / totalRelevantReviews) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
    };

    const negReviewsCount = reviews.filter(r => r.sentiment === 'Negative' && !r.isSuspicious).length;
    const posReviewsCount = reviews.filter(r => r.sentiment === 'Positive' && !r.isSuspicious).length;

    const topComplaints = formatTopics(complaintsCount, negReviewsCount);
    const topPraises = formatTopics(praisesCount, posReviewsCount);

    res.json({
      success: true,
      overallScore,
      fakePercentage,
      topComplaints,
      topPraises
    });

  } catch (error) {
    console.error("Error fetching XAI insights:", error);
    res.status(500).json({ success: false, message: "Server Error fetching XAI insights" });
  }
};