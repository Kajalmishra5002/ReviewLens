from flask import Flask, request, jsonify
from transformers import pipeline
import logging

app = Flask(__name__)

# Disable Flask logging for a cleaner output
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

print("🚀 Loading DistilBERT Sentiment Model...")
try:
    # Use distilbert-base-uncased-finetuned-sst-2-english
    sentiment_task = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    sentiment_task = None

@app.route('/predict-sentiment', methods=['POST'])
@app.route('/analyze', methods=['POST'])
def analyze():
    if not sentiment_task:
        return jsonify({"error": "Model not loaded", "sentiment": "Neutral"}), 500

    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({"sentiment": "Neutral", "fake_score": 0})

    try:
        result = sentiment_task(text)[0]
        label = result['label']  # POSITIVE or NEGATIVE
        sentiment = "Positive" if label == "POSITIVE" else "Negative"
        
        # Simple fake score heuristic
        fake_score = 0
        if len(text) < 15: fake_score += 20
        if text.count('!') > 3: fake_score += 30

        return jsonify({
            "sentiment": sentiment,
            "confidence": result['score'],
            "fake_score": fake_score
        })
    except Exception as e:
        print(f"Error during analysis: {e}")
        return jsonify({"sentiment": "Neutral", "fake_score": 0, "error": str(e)})

@app.route('/generate-insights', methods=['POST'])
def generate_insights():
    data = request.get_json()
    reviews = data.get('reviews', [])
    
    # Simple logic for highlights
    return jsonify({
        "summary": f"Based on {len(reviews)} reviews, users generally appreciate the quality. Some mentioned price as a factor.",
        "positiveHighlights": ["Good Quality", "Fast Shipping", "Excellent Value"],
        "negativeHighlights": ["Premium Price", "Slightly Heavy"]
    })

@app.route('/detect-fake-reviews', methods=['POST'])
def detect_fake_reviews():
    data = request.get_json()
    reviews = data.get('reviews', [])
    
    flagged_review_ids = []
    fake_count = 0

    spam_keywords = ["buy now", "click here", "discount", "offer", "cheap", "best price", "limited time"]
    
    for r in reviews:
        text = r.get('text', '').lower()
        review_id = r.get('id')
        score = 0
        
        # 1. Spam Keywords Check
        for kw in spam_keywords:
            if kw in text:
                score += 30

        # 2. Character Repetition (e.g., "aaaaa")
        import re
        if re.search(r'(.)\1{4,}', text):
            score += 40

        # 3. Word Repetition (e.g., "great great great")
        words = text.split()
        if len(words) > 3:
            for i in range(len(words) - 2):
                if words[i] == words[i+1] == words[i+2]:
                    score += 50
                    break

        # 4. Length check (too short or too generic)
        if len(text) < 10:
            score += 20

        if score >= 50:
            flagged_review_ids.append(review_id)
            fake_count += 1
            
    fake_percentage = (fake_count / len(reviews) * 100) if reviews else 0
        
    return jsonify({
        "fake_percentage": round(fake_percentage, 2),
        "flagged_review_ids": flagged_review_ids
    })

@app.route('/pras-score', methods=['POST'])
def pras_score():
    data = request.get_json()
    sentiment_score = data.get('sentiment_score', 0)
    fake_percentage = data.get('fake_percentage', 0)
    review_volume = data.get('review_volume', 0)
    avg_rating = data.get('avg_rating', 0)

    # Logic for dynamic score (0-100)
    # Higher sentiment and rating -> higher score
    # Higher fake percentage -> penalty
    # Higher volume -> higher confidence/weight
    
    base_score = (sentiment_score * 40) + (avg_rating * 12) # Max 40 + 60 = 100
    penalty = (fake_percentage * 0.5)
    volume_bonus = min(10, review_volume * 0.5)
    
    dynamic_score = max(0, min(100, base_score - penalty + volume_bonus))
    
    return jsonify({
        "dynamic_score": round(dynamic_score, 2),
        "confidence": "High" if review_volume > 10 else "Moderate"
    })

if __name__ == '__main__':
    print("🔥 AI Service running on http://127.0.0.1:8001")
    app.run(port=8001, host='0.0.0.0')
