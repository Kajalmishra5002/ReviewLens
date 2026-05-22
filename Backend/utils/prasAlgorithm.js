const axios = require("axios");

const calculateReviewWeight = (review, product) => {
  let credibilityWeight = 0.5;
  let consistencyWeight = 0.5;
  let recencyWeight = 0.5;
  let needAlignmentWeight = 0.4;

  // 1. Credibility (Based on length of comment)
  const commentLength = review.comment ? review.comment.length : 0;
  if (commentLength > 100) credibilityWeight = 1.0;
  else if (commentLength > 50) credibilityWeight = 0.8;
  else if (commentLength > 10) credibilityWeight = 0.5;
  else credibilityWeight = 0.2;

  // 2. Consistency (Sentiment matches rating)
  const sentiment = review.sentiment || "Neutral";
  const rating = review.rating || 0;

  if (sentiment === "Positive" && rating >= 4) consistencyWeight = 1.0;
  else if (sentiment === "Negative" && rating <= 2) consistencyWeight = 1.0;
  else if (sentiment === "Neutral" && (rating === 3 || rating === 4)) consistencyWeight = 0.8;
  else if (sentiment === "Positive" && rating <= 2) consistencyWeight = 0.1;
  else if (sentiment === "Negative" && rating >= 4) consistencyWeight = 0.1;
  else consistencyWeight = 0.5;

  // 3. Recency (Newer reviews get higher weight)
  const reviewDate = review.createdAt ? new Date(review.createdAt) : new Date();
  const daysOld = Math.floor((new Date() - reviewDate) / (1000 * 60 * 60 * 24));

  if (daysOld <= 30) recencyWeight = 1.0;
  else if (daysOld <= 90) recencyWeight = 0.8;
  else if (daysOld <= 365) recencyWeight = 0.6;
  else recencyWeight = 0.3;

  // 4. Need Alignment (Mentions important features/keywords)
  const keywords = ["camera", "battery", "display", "build", "value", "performance", "screen", "fast", "slow", "quality", "price"];
  if (product && product.category) keywords.push(product.category.toLowerCase());
  if (product && product.brand) keywords.push(product.brand.toLowerCase());

  let keywordCount = 0;
  if (review.comment) {
    const commentLower = review.comment.toLowerCase();
    keywords.forEach(kw => { if (commentLower.includes(kw)) keywordCount++; });
  }

  if (keywordCount >= 3) needAlignmentWeight = 1.0;
  else if (keywordCount >= 1) needAlignmentWeight = 0.7;
  else needAlignmentWeight = 0.4;

  return credibilityWeight * consistencyWeight * recencyWeight * needAlignmentWeight;
};

// Heuristic fallback (original algorithm, returns 0-5 scale)
const heuristicSmartScore = (reviews, product) => {
  if (!reviews || reviews.length === 0) return 0;

  let totalWeightedRating = 0;
  let totalWeightSum = 0;

  reviews.forEach(review => {
    const weight = calculateReviewWeight(review, product);
    totalWeightedRating += (review.rating * weight);
    totalWeightSum += weight;
  });

  if (totalWeightSum === 0) return 0;
  const smartScore = totalWeightedRating / totalWeightSum;
  return Math.round(Math.max(0, Math.min(5, smartScore)) * 10) / 10;
};

// PRAS v2: ML-based adaptive scoring
const calculateSmartScore = async (data, product) => {
  // Handle both (reviews, product) and ({sentiment_score, ...})
  let sentimentScore, fakePercentage, reviewVolume, avgRating;

  if (Array.isArray(data)) {
    const reviews = data;
    if (reviews.length === 0) return 0;
    const posCount = reviews.filter(r => r.sentiment === "Positive").length;
    const susCount = reviews.filter(r => r.isSuspicious).length;
    sentimentScore = posCount / reviews.length;
    fakePercentage = (susCount / reviews.length) * 100;
    reviewVolume = reviews.length;
    avgRating = reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length;
  } else {
    sentimentScore = data.sentiment_score || 0;
    fakePercentage = data.fake_percentage || 0;
    reviewVolume = data.review_volume || 0;
    avgRating = data.avg_rating || 0;
  }

  try {
    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/pras-score`,
      { sentiment_score: sentimentScore, fake_percentage: fakePercentage, review_volume: reviewVolume, avg_rating: avgRating },
      { timeout: 3000 }
    );

    const mlScore = response.data.dynamic_score;
    return Math.round((mlScore / 20) * 10) / 10; // 0-100 → 0-5
  } catch (err) {
    console.error("PRAS ML service unavailable. Using heuristic fallback.");
    // Fallback to heuristic if we have the reviews array
    if (Array.isArray(data)) return heuristicSmartScore(data, product);
    return Math.round((avgRating) * 10) / 10;
  }
};

module.exports = { calculateSmartScore, calculateReviewWeight };