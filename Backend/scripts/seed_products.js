const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');

const products = [
    {
        name: "iPhone 15 Pro",
        brand: "Apple",
        category: "Smartphone",
        price: 129900,
        description: "Titanium design, A17 Pro chip.",
        image: "https://m.media-amazon.com/images/I/81Sig6biNPL._SX679_.jpg",
        rating: 4.8
    },
    {
        name: "Samsung Galaxy S24 Ultra",
        brand: "Samsung",
        category: "Smartphone",
        price: 134900,
        description: "Galaxy AI and 200MP camera.",
        image: "https://m.media-amazon.com/images/I/71u9Y7d91xL._SX679_.jpg",
        rating: 4.7
    },
    {
        name: "OnePlus 12",
        brand: "OnePlus",
        category: "Smartphone",
        price: 64999,
        description: "Snapdragon 8 Gen 3, 100W charging.",
        image: "https://m.media-amazon.com/images/I/717937mI5+L._SX679_.jpg",
        rating: 4.6
    },
    {
        name: "MacBook Air M3",
        brand: "Apple",
        category: "Laptop",
        price: 114900,
        description: "Thin, fast, and M3 powered.",
        image: "https://m.media-amazon.com/images/I/71ItMhg1bxL._SX679_.jpg",
        rating: 4.9
    },
    {
        name: "Dell XPS 13",
        brand: "Dell",
        category: "Laptop",
        price: 139990,
        description: "InfinityEdge display, premium build.",
        image: "https://m.media-amazon.com/images/I/71+LREU6EIL._SX679_.jpg",
        rating: 4.5
    },
    {
        name: "Sony WH-1000XM5",
        brand: "Sony",
        category: "Headphones",
        price: 29990,
        description: "Best noise cancellation.",
        image: "https://m.media-amazon.com/images/I/51SKmu2G9FL._SX679_.jpg",
        rating: 4.9
    },
    {
        name: "iPad Pro M2",
        brand: "Apple",
        category: "Tablet",
        price: 81900,
        description: "M2 performance, Liquid Retina.",
        image: "https://m.media-amazon.com/images/I/81gC7frRJyL._SX679_.jpg",
        rating: 4.8
    },
    {
        name: "GoPro HERO12",
        brand: "GoPro",
        category: "Camera",
        price: 37990,
        description: "5.3K video, HyperSmooth 6.0.",
        image: "https://m.media-amazon.com/images/I/61MvJdfX66L._SX679_.jpg",
        rating: 4.7
    },
    {
        name: "PlayStation 5 Slim",
        brand: "Sony",
        category: "Gaming",
        price: 44990,
        description: "Lightning-fast SSD, haptic feedback.",
        image: "https://m.media-amazon.com/images/I/516L3f4Mv8L._SX679_.jpg",
        rating: 4.9
    },
    {
        name: "Google Pixel 8 Pro",
        brand: "Google",
        category: "Smartphone",
        price: 106990,
        description: "Best Pixel camera, Magic Editor.",
        image: "https://m.media-amazon.com/images/I/71v2jS669ML._SX679_.jpg",
        rating: 4.6
    },
    {
        name: "Asus ROG Zephyrus G14",
        brand: "Asus",
        category: "Laptop",
        price: 149990,
        description: "Powerful gaming laptop with Nebula HDR display.",
        image: "https://m.media-amazon.com/images/I/7106K9E8-LL._SX679_.jpg",
        rating: 4.8
    },
    {
        name: "Nintendo Switch OLED",
        brand: "Nintendo",
        category: "Gaming",
        price: 32900,
        description: "Vibrant OLED screen for handheld gaming.",
        image: "https://m.media-amazon.com/images/I/61M-Bq2vKOL._SX679_.jpg",
        rating: 4.9
    },
    {
        name: "Canon EOS R6 Mark II",
        brand: "Canon",
        category: "Camera",
        price: 229990,
        description: "High-performance full-frame mirrorless camera.",
        image: "https://m.media-amazon.com/images/I/71+ZqB-rA4L._SX679_.jpg",
        rating: 4.7
    },
    {
        name: "Bose QuietComfort Ultra",
        brand: "Bose",
        category: "Headphones",
        price: 35900,
        description: "World-class noise cancellation and immersive audio.",
        image: "https://m.media-amazon.com/images/I/51K8T-1-XhL._SX679_.jpg",
        rating: 4.8
    },
    {
        name: "Samsung Galaxy Tab S9",
        brand: "Samsung",
        category: "Tablet",
        price: 72999,
        description: "Dynamic AMOLED 2X display and S Pen included.",
        image: "https://m.media-amazon.com/images/I/71W8S1hBq9L._SX679_.jpg",
        rating: 4.7
    }
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB for seeding");
        await Product.deleteMany();
        console.log("🗑️ Cleared existing products");
        await Product.insertMany(products);
        console.log(`🚀 Seeded ${products.length} products successfully!`);
        process.exit();
    } catch (error) {
        console.error("❌ Seeding error:", error.message);
        process.exit(1);
    }
};

seedProducts();
