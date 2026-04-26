require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const User = require('./models/User');

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing products
    console.log("Clearing existing products...");
    await Product.deleteMany();

    // Get a fallback admin/user for reviews
    let defaultUser = await User.findOne({ role: 'Admin' }) || await User.findOne();
    if (!defaultUser) {
      console.log("No users found in database. Creating a dummy admin user.");
      defaultUser = await User.create({
        name: "Admin Reviewer",
        email: "admin_reviewer@reviewlens.com",
        password: "TempPassword123!",
        role: "Admin",
        isVerified: true
      });
    }

    const dataPath = path.join(__dirname, '../data/electronics_dataset.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const dataset = JSON.parse(rawData);

    console.log(`Loaded dataset with ${dataset.length} items. Mapping to Product schema...`);

    const productsToInsert = dataset.map(item => {
      // Create reviews array explicitly formatting for schema requirements
      const mappedReviews = (item.reviews || []).map(r => ({
        user: defaultUser._id, // the schema requires an ObjectId!
        name: r.userName || "Anonymous",
        rating: r.rating || 5,
        comment: r.reviewText || "No review text provided.",
        sentiment: r.sentiment || "Neutral"
      }));

      return {
        name: item.name,
        description: item.name + " - Best in class electronics.",
        brand: item.name ? item.name.split(' ')[0] : "Generic", // First word of name as brand
        price: item.price || 0,
        category: item.category || "Electronics",
        images: item.image ? [{ url: item.image, public_id: item.id || "img_1" }] : [],
        stock: 100, // Dummy stock
        ratings: item.rating || 0,
        numOfReviews: mappedReviews.length,
        features: item.features || [],
        reviews: mappedReviews,
        smartScore: Math.round((item.rating || 0) * 20), // mock out of 100
        trendingScore: Math.round(Math.random() * 100)
      };
    });

    console.log("Inserting products...");
    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:");
    console.error(error);
    process.exit(1);
  }
}

seedData();
