from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from typing import List, Optional
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import Ridge
import numpy as np
import random

app = FastAPI(title="ReviewLens Unified AI API", version="2.0.0")

# Load HuggingFace DistilBERT model
print("Loading Sentiment Model...")
try:
    sentiment_pipeline = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading sentiment model: {e}")
    sentiment_pipeline = None

# ==== PRAS v2: ML-Based Adaptive Scoring Model ====
_X_train = np.array([
    [0.95, 0.0,  3.0,  4.9],
    [0.85, 0.05, 2.5,  4.5],
    [0.75, 0.10, 2.0,  4.0],
    [0.60, 0.15, 1.5,  3.5],
    [0.45, 0.20, 1.0,  3.0],
    [0.30, 0.35, 0.5,  2.5],
    [0.20, 0.50, 0.3,  2.0],
    [0.10, 0.60, 0.2,  1.5],
    [0.80, 0.02, 2.8,  4.7],
    [0.55, 0.25, 1.2,  3.2],
])
_y_train = np.array([97, 88, 78, 65, 52, 38, 27, 16, 92, 46])

pras_model = Ridge(alpha=1.0)
pras_model.fit(_X_train, _y_train)
print("PRAS v2 regression model trained successfully!")

class ReviewRequest(BaseModel):
    text: str
    rating: Optional[int] = None

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    fake_score: float
    is_fake: bool

@app.post("/analyze", response_model=SentimentResponse)
@app.post("/predict-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: ReviewRequest):
    if not request.text or not request.text.strip():
        return SentimentResponse(sentiment="Neutral", confidence=1.0, fake_score=0, is_fake=False)

    # 1. Sentiment Analysis
    if sentiment_pipeline:
        result = sentiment_pipeline(request.text)[0]
        label = result['label']
        score = result['score']
        mapped_label = "Positive" if label == "POSITIVE" else "Negative"
        if score < 0.6: mapped_label = "Neutral"
    else:
        mapped_label = "Neutral"
        score = 0.5

    # 2. Heuristic Fake Score Calculation
    fake_score = 0
    reasons = []

    # Reason 1: Sentiment-Rating Mismatch
    if request.rating is not None:
        if (request.rating >= 4 and mapped_label == "Negative"):
            fake_score += 60
            reasons.append("sentiment_mismatch")
        elif (request.rating <= 2 and mapped_label == "Positive"):
            fake_score += 60
            reasons.append("sentiment_mismatch")

    # Reason 2: Text Length & Quality
    words = request.text.strip().split()
    if len(words) < 5:
        fake_score += 40
        reasons.append("too_short")
    
    # Reason 3: Repetitive Patterns
    word_counts = {}
    for w in words:
        w_lower = w.lower()
        word_counts[w_lower] = word_counts.get(w_lower, 0) + 1
    
    max_repeat = max(word_counts.values()) if word_counts else 0
    if max_repeat > len(words) * 0.5 and len(words) > 5:
        fake_score += 50
        reasons.append("repetitive")

    # 4. Length Check (Too short is suspicious)
    if len(request.text.split()) < 3:
        fake_score += 30
        reasons.append("Low Info Density (Too Short)")

    # 5. Punctuation Spam (e.g. "!!!", "???")
    if request.text.count('!') > 3 or request.text.count('?') > 3:
        fake_score += 25
        reasons.append("Punctuation Spam")

    is_fake = fake_score >= 50

    return SentimentResponse(
        sentiment=mapped_label, 
        confidence=round(score, 4),
        fake_score=float(fake_score),
        is_fake=is_fake
    )

class ReviewData(BaseModel):
    id: str
    text: str
    user_id: str
    timestamp: str
    rating: Optional[int] = 5

class FakeDetectionRequest(BaseModel):
    reviews: List[ReviewData]

@app.post("/detect-fake-reviews")
async def detect_fake_reviews(request: FakeDetectionRequest):
    reviews = request.reviews
    if not reviews:
        return {"fake_percentage": 0.0, "flagged_review_ids": []}

    flagged_ids = set()
    
    # 1. Same User Spam
    user_counts = {}
    for r in reviews:
        user_counts[r.user_id] = user_counts.get(r.user_id, 0) + 1
    for r in reviews:
        if user_counts[r.user_id] > 3: 
            flagged_ids.add(r.id)

    # 2. Text Similarity (Duplicate/Near-Duplicate)
    texts = [r.text for r in reviews]
    if len(texts) > 1:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = vectorizer.fit_transform(texts)
            cosine_sim = cosine_similarity(tfidf_matrix)
            for i in range(len(texts)):
                for j in range(i + 1, len(texts)):
                    if cosine_sim[i][j] >= 0.85:
                        flagged_ids.add(reviews[i].id)
                        flagged_ids.add(reviews[j].id)
        except Exception as e:
            print(f"Similarity detection error: {e}")

    # 3. Pattern Detection (e.g. all reviews same rating, very short)
    for r in reviews:
        if len(r.text.split()) < 3:
            flagged_ids.add(r.id)

    fake_percentage = (len(flagged_ids) / len(reviews)) * 100
    return {
        "fake_percentage": round(fake_percentage, 2), 
        "flagged_review_ids": list(flagged_ids),
        "total_reviews": len(reviews),
        "flagged_count": len(flagged_ids)
    }

class PRASRequest(BaseModel):
    sentiment_score: float
    fake_percentage: float
    review_volume: int
    avg_rating: float

@app.post("/pras-score")
def get_pras_score(req: PRASRequest):
    vol_log = float(np.log1p(req.review_volume))
    features = np.array([[req.sentiment_score, req.fake_percentage / 100.0, vol_log, req.avg_rating]])
    raw_score = pras_model.predict(features)[0]
    dynamic_score = round(float(np.clip(raw_score, 0, 100)), 2)
    
    grade = "A+" if dynamic_score >= 90 else "A" if dynamic_score >= 80 else "B" if dynamic_score >= 65 else "C" if dynamic_score >= 50 else "D"
    
    return {
        "dynamic_score": dynamic_score,
        "grade": grade,
        "explanation": f"Score driven by {req.sentiment_score*100:.0f}% positive sentiment across {req.review_volume} reviews."
    }

class InsightRequest(BaseModel):
    reviews: List[str]

@app.post("/generate-insights")
async def generate_insights(req: InsightRequest):
    if not req.reviews:
        return {"summary": "No reviews yet.", "positiveHighlights": [], "negativeHighlights": []}
    
    # Basic logic to extract common themes (in production, use LLM)
    keywords = ["battery", "camera", "display", "build", "price", "performance", "delivery", "packaging", "sound", "quality"]
    pos_themes = []
    neg_themes = []
    
    for r in req.reviews:
        text = r.lower()
        # Mocking sentiment check (in reality, we'd use the sentiment model)
        is_pos = any(word in text for word in ["great", "good", "excellent", "amazing", "love"])
        for kw in keywords:
            if kw in text:
                if is_pos: pos_themes.append(kw)
                else: neg_themes.append(kw)
                
    # Get top 3 unique themes
    pos_h = list(set(pos_themes))[:3]
    neg_h = list(set(neg_themes))[:3]
    
    summary = f"Users generally appreciate the {', '.join(pos_h) if pos_h else 'product'}. "
    if neg_h:
        summary += f"However, some have noted concerns regarding {', '.join(neg_h)}."
        
    return {
        "summary": summary,
        "positiveHighlights": [f"Great {h}" for h in pos_h],
        "negativeHighlights": [f"Issues with {h}" for h in neg_h]
    }

class DescriptionRequest(BaseModel):
    name: str
    brand: Optional[str] = ""
    category: Optional[str] = ""
    features: Optional[List[str]] = []

@app.post("/generate")
async def generate_description(req: DescriptionRequest):
    feat_str = ", ".join(req.features) if req.features else "premium features"
    description = f"The {req.brand} {req.name} is a state-of-the-art {req.category} designed for excellence. Featuring {feat_str}, it offers a seamless experience for modern users."
    return {"description": description}

class RecommendRequest(BaseModel):
    user_id: str
    purchase_history: List[str] = []

@app.post("/recommend")
async def recommend_products(req: RecommendRequest):
    # Mock recommendation logic: returning empty list to trigger backend fallback
    # or could return some random IDs if we had a list.
    return {"recommended_ids": []}

@app.get("/health")

def health_check():
    return {"status": "ok", "service": "Unified AI"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)