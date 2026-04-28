const axios = require("axios");

// Fallback logic if ML service is down
const positiveWords = ["good", "great", "best", "awesome", "excellent"];
const negativeWords = ["bad", "worst", "poor", "waste", "slow"];

const basicSentimentAnalysis = (text) => {
  let score = 0;
  text.toLowerCase().split(" ").forEach((word) => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });
  return score >= 0 ? "Positive" : "Negative";
};

exports.analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict-sentiment`, {
      text: text
    }, { timeout: 3000 }); // 3 second timeout

    return response.data.label || "Neutral";
  } catch (error) {
    console.error("FastAPI Sentiment Service unavailable. Falling back to basic analysis.");
    return basicSentimentAnalysis(text);
  }
};