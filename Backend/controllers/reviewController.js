const Review = require("../models/Review.js");
const { analyzeSentiment } = require("../utils/sentiment.js");
const axios = require("axios");

exports.addReview = async (req, res) => {
  try {
    const { productId, userId, reviewText, rating, name } = req.body;

    if (!productId || !userId || !reviewText || !rating || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sentiment = await analyzeSentiment(reviewText);

    const review = await Review.create({
      productId,
      userId,
      name,
      rating,
      reviewText,
      sentiment,
    });

    // ✅ Sync with Product embedded reviews
    const product = await require("../models/Product").findById(productId);
    if (product) {
      const isReviewed = product.reviews.find(
        r => r.user.toString() === userId.toString()
      );

      if (isReviewed) {
        product.reviews.forEach(r => {
          if (r.user.toString() === userId.toString()) {
            r.rating = rating;
            r.comment = reviewText;
            r.sentiment = sentiment;
          }
        });
      } else {
        product.reviews.push({
          user: userId,
          name,
          rating,
          comment: reviewText,
          sentiment
        });
      }
      product.numOfReviews = product.reviews.length;
      product.ratings = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
      await product.save();
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server Error adding review" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find all reviews for this product
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server Error fetching reviews" });
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
        { $set: { isSuspicious: true } }
      );
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