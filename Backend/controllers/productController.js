const Product = require('../models/Product');
const { dummyProducts } = require('../data/dummyData');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
    try {
        console.log("🔍 Fetching products from MongoDB...");
        const products = await Product.find().sort({ createdAt: -1 });
        
        if (!products || products.length === 0) {
            console.log("⚠️ No products found in DB. Returning dummy data for frontend.");
            return res.status(200).json({
                success: true,
                count: dummyProducts.length,
                products: dummyProducts
            });
        }

        console.log(`✅ Successfully fetched ${products.length} products from DB.`);
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.error("❌ Error fetching products:", error.message);
        // Fallback to dummy data so frontend doesn't break
        res.status(200).json({
            success: true,
            message: "Database error, using fallback data",
            products: dummyProducts
        });
    }
};

/**
 * @desc    Get single product
 * @route   GET /api/products/:id
 */
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            const dummy = dummyProducts.find(p => p._id === req.params.id);
            if (dummy) return res.json(dummy);
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json(product);
    } catch (error) {
        const dummy = dummyProducts.find(p => p._id === req.params.id);
        if (dummy) return res.json(dummy);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Search products
 */
exports.searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, products: [] });

        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { brand: { $regex: q, $options: 'i' } },
                { category: { $regex: q, $options: 'i' } }
            ]
        });

        res.json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add other necessary exports
exports.getBestProducts = async (req, res) => {
    try {
        const products = await Product.find({ rating: { $gte: 4.5 } }).limit(4);
        res.json({ success: true, products: products.length > 0 ? products : dummyProducts.slice(0, 4) });
    } catch (err) {
        res.json({ success: true, products: dummyProducts.slice(0, 4) });
    }
};

exports.getTrendingProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 }).limit(4);
        res.json({ success: true, products: products.length > 0 ? products : dummyProducts.slice(0, 4) });
    } catch (err) {
        res.json({ success: true, products: dummyProducts.slice(0, 4) });
    }
};

exports.compareProducts = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.status(400).json({ message: 'No product IDs' });
        const idArray = ids.split(',');
        const products = await Product.find({ _id: { $in: idArray } });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
