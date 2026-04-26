require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");
    
    const res = await User.updateMany(
      { isVerified: { $exists: false } },
      { $set: { isVerified: true } }
    );
    console.log("Migration complete. Modified count:", res.modifiedCount);
    
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
