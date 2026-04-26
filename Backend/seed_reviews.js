require('dotenv').config();
const mongoose = require('mongoose');

async function seedReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const products = await mongoose.connection.db.collection('products').find().toArray();
    const users = await mongoose.connection.db.collection('users').find().toArray();

    if (products.length === 0 || users.length === 0) {
      console.log("No products or users found.");
      process.exit(0);
    }

    const testUser = users[0];
    const newReviews = [];

    for (const p of products) {
      const existing = await mongoose.connection.db.collection('reviews').countDocuments({ productId: p._id });
      if (existing === 0) {
        newReviews.push({
          productId: p._id,
          userId: testUser._id,
          name: testUser.name || 'John Doe',
          rating: 5,
          reviewText: 'This is an excellent product. The quality is outstanding and it performs perfectly.',
          sentiment: 'Positive',
          createdAt: new Date()
        });
        newReviews.push({
          productId: p._id,
          userId: testUser._id,
          name: 'Jane Smith',
          rating: 4,
          reviewText: 'Good value for money. There are a few minor issues but overall a great purchase.',
          sentiment: 'Positive',
          createdAt: new Date(Date.now() - 86400000)
        });
        newReviews.push({
          productId: p._id,
          userId: testUser._id,
          name: 'Angry Customer',
          rating: 2,
          reviewText: 'Not what I expected. The build quality feels cheap and the delivery was late.',
          sentiment: 'Negative',
          createdAt: new Date(Date.now() - 172800000)
        });
      }
    }

    if (newReviews.length > 0) {
      await mongoose.connection.db.collection('reviews').insertMany(newReviews);
      console.log(`Seeded ${newReviews.length} demo reviews!`);
    } else {
      console.log("Reviews already exist for products.");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seedReviews();
