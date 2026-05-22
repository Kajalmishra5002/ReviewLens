const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: '../.env' });

const products = [
  {
    name: "iPhone 15 Pro",
    category: "Smartphones",
    brand: "Apple",
    price: 134900,
    description: "Titanium design, A17 Pro chip, versatile camera system.",
    rating: 4.8,
    image: "https://m.media-amazon.com/images/I/81Sig6biNPL._SX679_.jpg",
    images: [{ url: "https://m.media-amazon.com/images/I/81Sig6biNPL._SX679_.jpg" }],
    stock: 15
  },
  {
    name: "Sony WH-1000XM5",
    category: "Headphones",
    brand: "Sony",
    price: 29990,
    description: "Industry-leading noise cancelling with dual processor V1.",
    rating: 4.7,
    image: "https://m.media-amazon.com/images/I/51aB7hr88RL._SX679_.jpg",
    images: [{ url: "https://m.media-amazon.com/images/I/51aB7hr88RL._SX679_.jpg" }],
    stock: 25
  },
  {
    name: "MacBook Air M2",
    category: "Laptops",
    brand: "Apple",
    price: 114900,
    description: "Strikingly thin design, M2 chip, 13.6-inch Liquid Retina display.",
    rating: 4.9,
    image: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg",
    images: [{ url: "https://m.media-amazon.com/images/I/71f5Eu5lJSL._SX679_.jpg" }],
    stock: 10
  }
];

const seedProducts = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb+srv://Kajal:Mishra-5002@cluster0.krkcy78.mongodb.net/reviewlens";
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    await Product.deleteMany();
    console.log("Deleted existing products...");

    await Product.insertMany(products);
    console.log("✅ 3 Sample Products Inserted Successfully!");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding products:", err.message);
    process.exit(1);
  }
};

seedProducts();
