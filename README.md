# ReviewLens AI - Smart Buying Platform

ReviewLens is a modern AI-powered platform designed to help users research products smarter. It uses PRAS (Product Review Analysis System) to aggregate sentiment, detect fake reviews, and provide a single "Smart Score" for buying decisions.

## 🚀 Actual Tech Stack
- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** FastAPI (Python)
- **Database:** MongoDB Atlas
- **ML Engine:** Naive Bayes + TF-IDF (Scikit-Learn)
- **State Management:** Zustand

## ✨ Core Features
- **PRAS Scoring:** Proprietary algorithm for unbiased product ratings.
- **AI Sentiment Analysis:** Real-time analysis of user reviews using Naive Bayes.
- **Side-by-Side Comparison:** Compare products based on feature-specific AI scores.
- **Demo Mode:** Seamlessly switches to local dummy data if MongoDB connection fails.
- **Responsive Dashboard:** Premium dark-themed UI for browsing and searching.

## 🛠️ Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas Account (Optional, falls back to Demo Mode)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
The backend will run at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run at `http://localhost:5173`.

### 4. Data Import (Optional)
To import the latest Excel dataset into your MongoDB Atlas:
```bash
python backend/scripts/import_data.py
```

## 🧹 Folder Structure
- `backend/`: FastAPI application and ML logic.
- `frontend/`: React components and pages.
- `data/`: Excel datasets and JSON fallbacks.
- `scripts/`: Data migration and import tools.

## ⚖️ License
MIT
