require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function upgradeSeller() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Upgrade the first User or a specific user
    // We will find a user who is not already Admin and upgrade them, or just pick the first one.
    let targetUser = await User.findOne({ email: "admin_reviewer@reviewlens.com" }) || await User.findOne();
    
    if (!targetUser) {
        console.log("No users found to upgrade.");
        process.exit(1);
    }
    
    console.log(`Setting ${targetUser.email} to Seller role...`);
    
    targetUser.role = "Seller";
    // Also ensure they are verified
    targetUser.isVerified = true;
    
    await targetUser.save({ validateBeforeSave: false });
    
    console.log(`Successfully upgraded ${targetUser.email} to Seller!`);
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

upgradeSeller();
