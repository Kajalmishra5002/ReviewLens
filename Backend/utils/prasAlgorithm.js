const calculateReviewWeight = (review, product) => {
  let credibilityWeight = 0.5;
  let consistencyWeight = 0.5;
  let recencyWeight = 0.5;
  let needAlignmentWeight = 0.4;

  // 1. Credibility (Based on length of comment, assuming longer reviews are more credible)
  const commentLength = review.comment ? review.comment.length : 0;
  if (commentLength > 100) credibilityWeight = 1.0;
  else if (commentLength > 50) credibilityWeight = 0.8;
  else if (commentLength > 10) credibilityWeight = 0.5;
  else credibilityWeight = 0.2; // Likely spam or very low effort

  // 2. Consistency (Sentiment matches rating)
  const sentiment = review.sentiment || "Neutral";
  const rating = review.rating || 0;

  if (sentiment === "Positive" && rating >= 4) consistencyWeight = 1.0;
  else if (sentiment === "Negative" && rating <= 2) consistencyWeight = 1.0;
  else if (sentiment === "Neutral" && (rating === 3 || rating === 4)) consistencyWeight = 0.8;
  else if (sentiment === "Positive" && rating <= 2) consistencyWeight = 0.1; // Highly inconsistent (e.g., sarcastic or spam)
  else if (sentiment === "Negative" && rating >= 4) consistencyWeight = 0.1; // Highly inconsistent
  else consistencyWeight = 0.5;

  // 3. Recency (Newer reviews get higher weight)
  const reviewDate = review.createdAt ? new Date(review.createdAt) : new Date();
  const currentDate = new Date();
  const daysOld = Math.floor((currentDate - reviewDate) / (1000 * 60 * 60 * 24));

  if (daysOld <= 30) recencyWeight = 1.0;
  else if (daysOld <= 90) recencyWeight = 0.8;
  else if (daysOld <= 365) recencyWeight = 0.6;
  else recencyWeight = 0.3; // Very old reviews matter less

  // 4. Need Alignment (Mentions important features/keywords)
  const keywords = ["camera", "battery", "display", "build", "value", "performance", "screen", "fast", "slow", "quality", "price"];
  // Add product specific keywords if available
  if (product && product.category) keywords.push(product.category.toLowerCase());
  if (product && product.brand) keywords.push(product.brand.toLowerCase());

  let keywordCount = 0;
  if (review.comment) {
    const commentLower = review.comment.toLowerCase();
    keywords.forEach(kw => {
      if (commentLower.includes(kw)) keywordCount++;
    });
  }

  if (keywordCount >= 3) needAlignmentWeight = 1.0;
  else if (keywordCount >= 1) needAlignmentWeight = 0.7;
  else needAlignmentWeight = 0.4;

  // Total Weight Calculation (normalized between 0 and 1)
  const totalWeight = credibilityWeight * consistencyWeight * recencyWeight * needAlignmentWeight;
  return totalWeight;
};

exports.calculateProductSmartScore = (reviews, product) => {
  if (!reviews || reviews.length === 0) return 0;

  let totalWeightedRating = 0;
  let totalWeightSum = 0;

  reviews.forEach(review => {
    const weight = calculateReviewWeight(review, product);
    totalWeightedRating += (review.rating * weight);
    totalWeightSum += weight;
  });

  if (totalWeightSum === 0) return 0;

  let smartScore = totalWeightedRating / totalWeightSum;
  
  // Cap between 0 and 5, and round to 1 decimal place
  smartScore = Math.max(0, Math.min(5, smartScore));
  return Math.round(smartScore * 10) / 10;
};
