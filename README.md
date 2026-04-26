# ReviewLens - AI Product Review Sentiment Analysis

ReviewLens is a full-stack, AI-powered e-commerce and analytics platform designed to help consumers make informed purchasing decisions. Utilizing Natural Language Processing (NLP) techniques, the system performs intelligent sentiment analysis on product reviews and calculates a proprietary "smartScore" using the PRAS algorithm.

## Features
- **Sentiment Analysis:** Analyzes product reviews to determine positive, negative, or neutral sentiment.
- **PRAS Algorithm:** Evaluates products based on Sentiment, Credibility, Consistency, Recency, and Need Alignment.
- **Smart Shopping Cart:** Persistent cart management using Zustand.
- **Product Comparisons:** Compare products limit-aware (Max 3) with smart category matching.
- **Secure Authentication:** JWT based user authentication.
- **Payment Gateway:** Razorpay integration for seamless checkouts.
- **Gift Cards:** Support for applying automated discounts and gift cards.
- **Responsive UI:** Modern, responsive "SmartBuy" design with Dark/Light modes.

## Tech Stack
- **Frontend:** React, Vite, TailwindCSS, Zustand, Framer Motion
- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **AI/ML:** Python, Flask (for NLP text processing)

## Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kajalmishra5002/my-fullstack-app.git
   cd my-fullstack-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment Variables:**
   Create a `.env` file inside the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   AI_SERVICE_URL=http://127.0.0.1:5001
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Run the Project Locally:**
   From the root folder, run:
   ```bash
   npm run dev
   ```
   This uses `concurrently` to run both the Node backend (port 5000) and the Vite frontend (port 5173).

## Deployment

### Frontend (Vercel / Netlify)
1. Set the root directory to `frontend`.
2. Build Command: `npm run build`
3. Output Directory: `dist`

### Backend (Render / Railway)
1. Set the root directory to `backend` (or run `npm run server` from root).
2. Start Command: `node index.js`
3. Ensure Environment Variables are configured in the platform dashboard.
