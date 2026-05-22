const axios = require('axios');

/**
 * Analyzes the sentiment of a given text.
 * Bridges to the Python AI service if available, otherwise uses basic fallback logic.
 * @param {string} text - The review text to analyze.
 * @returns {string} - 'Positive', 'Neutral', or 'Negative'.
 */
const analyzeSentiment = async (text) => {
    if (!text || text.trim().length === 0) return 'Neutral';

    try {
        const response = await axios.post(`${process.env.AI_SERVICE_URL}/predict-sentiment`, {
            text: text
        }, { timeout: 3000 });

        if (response.data && response.data.sentiment) {
            return response.data.sentiment;
        }
    } catch (error) {
        console.warn('⚠️ AI Service unreachable for sentiment analysis, using fallback logic.'.yellow);
    }

    // Basic Fallback Logic
    const positiveWords = ['great', 'good', 'excellent', 'amazing', 'love', 'best', 'perfect', 'awesome', 'nice'];
    const negativeWords = ['bad', 'worst', 'terrible', 'awful', 'poor', 'hate', 'disappointed', 'waste', 'broken'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => { if (lowerText.includes(word)) score++; });
    negativeWords.forEach(word => { if (lowerText.includes(word)) score--; });
    
    if (score > 0) return 'Positive';
    if (score < 0) return 'Negative';
    return 'Neutral';
};

module.exports = { analyzeSentiment };
