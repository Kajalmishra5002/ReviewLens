const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/reviewlens');
  const count = await mongoose.connection.db.collection('reviews').countDocuments();
  console.log('Total Reviews:', count);
  const pCount = await mongoose.connection.db.collection('products').countDocuments();
  console.log('Total Products:', pCount);

  if (count === 0 && pCount > 0) {
    const p = await mongoose.connection.db.collection('products').findOne();
    const u = await mongoose.connection.db.collection('users').findOne();
    
    if (p && u) {
      await mongoose.connection.db.collection('reviews').insertMany([
        {
          productId: p._id,
          userId: u._id,
          name: u.name || 'Test User',
          rating: 5,
          reviewText: 'This is an amazing product! Very happy with it. The battery is great.',
          sentiment: 'Positive',
          createdAt: new Date()
        },
        {
          productId: p._id,
          userId: u._id,
          name: u.name || 'Test User 2',
          rating: 2,
          reviewText: 'Not what I expected. The screen is too dim and it arrived late.',
          sentiment: 'Negative',
          createdAt: new Date()
        }
      ]);
      console.log('Seeded 2 test reviews for product:', p._id);
    }
  }

  process.exit(0);
}

check();
