from flask import Flask, request, jsonify
from textblob import TextBlob

app = Flask(__name__)

# 🔥 Sentiment Analysis
@app.route('/analyze', methods=['POST'])
def analyze():
    text = request.json.get('text')
    analysis = TextBlob(text)

    polarity = analysis.sentiment.polarity

    if polarity > 0:
        sentiment = "Positive"
    elif polarity < 0:
        sentiment = "Negative"
    else:
        sentiment = "Neutral"

    return jsonify({ "sentiment": sentiment })


# 🔥 Recommendation (basic)
@app.route('/recommend', methods=['POST'])
def recommend():
    purchase_history = request.json.get('purchase_history', [])

    # dummy logic
    recommended_ids = purchase_history[-3:]

    return jsonify({ "recommended_ids": recommended_ids })


# 🔥 AI Search
@app.route('/search', methods=['POST'])
def search():
    query = request.json.get('query')

    return jsonify({
        "products": [
            {"name": f"AI Result for {query}"}
        ]
    })

@app.route('/')
def home():
    return "AI Service Running 🚀"


if __name__ == '__main__':
    app.run(port=5001)