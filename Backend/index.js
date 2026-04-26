const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS (frontend Vite port)
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // ⭐ add this
app.use('/api/reviews', require('./routes/reviewRoutes')); // ✅ Add reviews route
app.use('/api/recommendations', require('./routes/recommendationRoutes')); // ⭐ AI feature
app.use('/api/payment', require('./routes/paymentRoutes')); // ✅ Add payment route
app.use('/api/giftcard', require('./routes/giftcardRoutes')); // ✅ Add gift card route
app.use('/api/cart', require('./routes/cartRoutes')); // ✅ Add cart route

// ✅ Health check route (very useful)
app.get('/api/health', (req, res) => {
  res.send('API is running 🚀');
});

// ✅ Serve static frontend files (for deployment)
const path = require('path');
const __dirname_resolved = path.resolve();
app.use(express.static(path.join(__dirname_resolved, '../frontend/dist')));

// Catch-all route to serve React app for non-API requests
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname_resolved, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ success: false, message: "API Route Not Found" });
  }
});

// ✅ DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch(err => {
    console.error('❌ DB Error:', err);
    process.exit(1);
  });
