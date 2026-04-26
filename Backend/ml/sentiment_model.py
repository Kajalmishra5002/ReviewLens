import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import pickle

# Sample dataset
data = {
    "text": [
        "this product is great",
        "very bad quality",
        "excellent performance",
        "worst experience",
        "good phone",
        "not worth money"
    ],
    "label": ["Positive", "Negative", "Positive", "Negative", "Positive", "Negative"]
}

df = pd.DataFrame(data)

# Vectorization
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])
y = df["label"]

# Model train
model = MultinomialNB()
model.fit(X, y)

# Save model
pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))

print("✅ Model trained & saved")