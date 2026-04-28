const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Review = require('./models/Review');
require('dotenv').config({ path: './backend/.env' });

const categories = ['Smartphone', 'Laptop', 'Headphones', 'Smartwatch', 'Camera', 'Tablet', 'Gaming Console'];
const brands = {
  'Smartphone': ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'],
  'Laptop': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
  'Headphones': ['Sony', 'Bose', 'Sennheiser', 'JBL', 'Beats'],
  'Smartwatch': ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Fossil'],
  'Camera': ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
  'Tablet': ['Apple', 'Samsung', 'Microsoft', 'Lenovo', 'Amazon'],
  'Gaming Console': ['Sony', 'Microsoft', 'Nintendo', 'Valve', 'Logitech']
};

const productImages = {
  'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
  'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
  'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
  'Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
  'Camera': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
  'Tablet': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
  'Gaming Console': 'https://images.unsplash.com/photo-1486401899880-15330ff65a7d?w=800'
};

const positiveReviews = [
  "Absolutely amazing! The performance is top-notch.",
  "The build quality is premium. Definitely worth the price.",
  "I'm impressed with the battery life. Lasts all day.",
  "The display is beautiful. Best in its class.",
  "Highly recommended for anyone looking for quality.",
  "Fast delivery and great packaging. Product is flawless.",
  "Great value for money. Better than I expected."
];

const negativeReviews = [
  "Disappointed with the camera quality. Expected more.",
  "Battery life is subpar. Needs constant charging.",
  "Build quality feels cheap. Plastic everywhere.",
  "The software is buggy. Keeps crashing.",
  "Overpriced for what it offers. There are better alternatives.",
  "Started making a weird noise after a week.",
  "Customer support was unhelpful when I reported an issue."
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('🗑️  Cleared old products and reviews.');

    // Find or create admin user
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      admin = await User.create({
        name: 'Admin User',
        email: 'admin@reviewlens.com',
        password: 'adminpassword123',
        role: 'Admin',
        isVerified: true
      });
      console.log('👤 Created default Admin user.');
    }

    // Create some dummy users for reviews
    const reviewers = [];
    for (let i = 0; i < 5; i++) {
      let reviewer = await User.findOne({ email: `user${i}@test.com` });
      if (!reviewer) {
        reviewer = await User.create({
          name: `User ${i}`,
          email: `user${i}@test.com`,
          password: 'password123',
          isVerified: true
        });
      }
      reviewers.push(reviewer);
    }

    const productsToInsert = [];

    // Generate 100+ products
    for (let i = 1; i <= 105; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[category][Math.floor(Math.random() * brands[category].length)];
      const price = Math.floor(Math.random() * 150000) + 1000;
      
      const product = {
        name: `${brand} ${category} ${String.fromCharCode(64 + (i % 26))}${i}`,
        description: `Experience the latest technology with the all-new ${brand} ${category}. Packed with high-end features and premium design.`,
        brand,
        price,
        category,
        images: [{ url: productImages[category] || 'https://via.placeholder.com/800', public_id: `prod_${i}` }],
        stock: Math.floor(Math.random() * 100) + 10,
        createdBy: admin._id,
        tags: [category, brand, 'Latest', 'Premium'],
        features: ['Premium Design', 'Fast Performance', 'Long Battery Life', 'High Resolution'],
        reviews: []
      };

      // Generate 10-20 reviews per product
      const numReviews = Math.floor(Math.random() * 11) + 10;
      let totalRating = 0;

      for (let j = 0; j < numReviews; j++) {
        const isPositive = Math.random() > 0.3;
        const rating = isPositive ? (Math.floor(Math.random() * 2) + 4) : (Math.floor(Math.random() * 3) + 1);
        const comment = isPositive ? positiveReviews[Math.floor(Math.random() * positiveReviews.length)] : negativeReviews[Math.floor(Math.random() * negativeReviews.length)];
        const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];

        const review = {
          user: reviewer._id,
          name: reviewer.name,
          rating,
          comment,
          sentiment: isPositive ? "Positive" : "Negative"
        };

        product.reviews.push(review);
        totalRating += rating;
      }

      product.ratings = totalRating / numReviews;
      product.numOfReviews = numReviews;
      product.smartScore = (product.ratings * 20); // Normalized to 100

      productsToInsert.push(product);
    }

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`🚀 Successfully seeded ${insertedProducts.length} products.`);

    // Also populate the standalone Review collection for sync
    const standaloneReviews = [];
    insertedProducts.forEach(prod => {
      prod.reviews.forEach(rev => {
        standaloneReviews.push({
          productId: prod._id,
          userId: rev.user,
          name: rev.name,
          rating: rev.rating,
          reviewText: rev.comment,
          sentiment: rev.sentiment
        });
      });
    });

    await Review.insertMany(standaloneReviews);
    console.log(`💬 Successfully seeded ${standaloneReviews.length} standalone reviews.`);

    console.log('✨ Dataset seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
