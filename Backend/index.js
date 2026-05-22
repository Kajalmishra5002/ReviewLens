const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const colors = require('colors');
const path = require('path');

// ✅ Force absolute path for .env to avoid resolution issues on Windows
require('dotenv').config({ path: path.join(__dirname, '.env') });

// ✅ Import DB Connection
const { connectDB } = require('./config/db');

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

/**
 * Start Server only after MongoDB is ready
 */
const startServer = async () => {
    try {
        // 1. Initialize MongoDB
        await connectDB();

        // ✅ Auto-seed database if empty (safety net for new database setups/deployments)
        if (global.isDBConnected) {
            const Product = require('./models/Product');
            const count = await Product.countDocuments();
            if (count === 0) {
                console.log("🌱 Database connected but empty. Seeding products automatically...".yellow.bold);
                const { dummyProducts } = require('./data/dummyData');
                if (dummyProducts && dummyProducts.length > 0) {
                    await Product.insertMany(dummyProducts);
                    console.log(`🚀 Successfully auto-seeded ${dummyProducts.length} products!`.green.bold);
                }
            }
        }

        // 2. Load API Routes
        app.use('/api/auth', require('./routes/authRoutes'));
        app.use('/api/products', require('./routes/productRoutes'));
        app.use('/api/orders', require('./routes/orderRoutes'));
        app.use('/api/admin', require('./routes/adminRoutes'));
        app.use('/api/reviews', require('./routes/reviewRoutes'));
        app.use('/api/recommendations', require('./routes/recommendationRoutes'));
        app.use('/api/payment', require('./routes/paymentRoutes'));
        app.use('/api/giftcard', require('./routes/giftcardRoutes'));
        app.use('/api/cart', require('./routes/cartRoutes'));
        app.use('/api/notifications', require('./routes/notificationRoutes'));
        app.use('/api/users', require('./routes/userRoutes'));
        app.use('/api/wishlist', require('./routes/wishlistRoutes'));

        // Health check
        app.get('/api/health', (req, res) => {
            res.status(200).json({ success: true, message: 'ReviewLens API is online 🚀' });
        });

        // Static files
        const __dirname_resolved = path.resolve();
        app.use(express.static(path.join(__dirname_resolved, '../frontend/dist')));

        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(path.join(__dirname_resolved, '../frontend/dist/index.html'));
            } else {
                res.status(404).json({ success: false, message: "API Route Not Found" });
            }
        });

        // 3. Listen
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`.magenta.bold);
            console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`.blue);
        });

    } catch (error) {
        console.error(`🛑 Server Startup Failed: ${error.message}`.red.bold);
        process.exit(1);
    }
};

startServer();