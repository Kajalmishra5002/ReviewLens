import pickle
import sys

model = pickle.load(open("model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

text = sys.argv[1]

X = vectorizer.transform([text])
prediction = model.predict(X)

print(prediction[0])