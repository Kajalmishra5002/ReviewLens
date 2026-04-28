const express = require("express");
const { addReview, getProductReviews, detectFakeReviewsForProduct, getProductXAIInsights } = require("../controllers/reviewController.js");

const router = express.Router();

router.post("/", addReview);
router.get("/:productId", getProductReviews);
router.post("/:productId/detect-fake-reviews", detectFakeReviewsForProduct);
router.get("/:productId/xai-insights", getProductXAIInsights);

module.exports = router;
