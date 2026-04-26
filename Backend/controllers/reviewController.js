const Review = require("../models/Review.js");
const { analyzeSentiment } = require("../utils/sentiment.js");

exports.addReview = async (req, res) => {
  try {
    const { productId, userId, reviewText, rating, name } = req.body;

    if (!productId || !userId || !reviewText || !rating || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const sentiment = analyzeSentiment(reviewText);

    const review = await Review.create({
      productId,
      userId,
      name,
      rating,
      reviewText,
      sentiment,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Server Error adding review" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find all reviews for this product
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server Error fetching reviews" });
  }
};