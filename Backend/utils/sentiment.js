const positiveWords = ["good", "great", "best", "awesome", "excellent"];
const negativeWords = ["bad", "worst", "poor", "waste", "slow"];

exports.analyzeSentiment = (text) => {
  let score = 0;

  text.toLowerCase().split(" ").forEach((word) => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  return score >= 0 ? "Positive" : "Negative";
};