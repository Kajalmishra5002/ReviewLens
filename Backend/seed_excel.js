require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const Product = require('./models/Product');
const User = require('./models/User'); // Used only if needing actual object references

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB -> Loading Excel Database...");

    // 1. Read Excel file
    const workbook = xlsx.readFile('../data/electronics_dataset.xlsx');
    
    // Parse sheets
    const productsData = xlsx.utils.sheet_to_json(workbook.Sheets['Products']);
    const reviewsData = xlsx.utils.sheet_to_json(workbook.Sheets['Reviews']);
    const usersData = xlsx.utils.sheet_to_json(workbook.Sheets['Users']);

    // 2. Map Users
    const usersMap = {};
    usersData.forEach(u => {
      usersMap[u.user_id] = u.user_name || "Verified Buyer";
    });

    // 3. Clear existing DB
    await Product.deleteMany({});
    console.log("Cleared old product catalog.");

    // Create a dummy user ObjectId to fulfill strict ref constraints in the current schema
    let dummyUser = await User.findOne({ email: "systems@reviewlens.com" });
    if (!dummyUser) {
      dummyUser = await User.create({
        name: "ReviewLens System Account",
        email: "systems@reviewlens.com",
        password: "hashed_dummy_password",
        role: "User"
      });
    }

    // 4. Transform Products and Embed Reviews
    const dbPayload = productsData.map(p => {
      // Find matching reviews in flat data
      const prodReviews = reviewsData.filter(r => r.product_id === p.product_id).map(r => ({
        user: dummyUser._id, // Assign generic user ID since we aren't migrating all user structures
        name: usersMap[r.user_id] || "Verified Buyer",
        rating: r.rating,
        comment: r.review_text,
        sentiment: r.sentiment,
        createdAt: r.review_date ? new Date((r.review_date - (25567 + 1)) * 86400 * 1000) : new Date(r.review_date || Date.now()) // Excel serial date parsing failsafe
      }));
      
      // Parse Features
      let parsedFeatures = [];
      if (typeof p.features === 'string') {
        parsedFeatures = p.features.split('|').map(s => s.trim()).filter(s => s);
      } else if (Array.isArray(p.features)) {
        parsedFeatures = p.features;
      }

      // Convert Excel literal strings correctly if dates are standard strings
      prodReviews.forEach(r => {
        if(isNaN(r.createdAt.getTime())) {
          r.createdAt = new Date(); // fallback if direct Excel epoch parsing failed
        }
      });

      return {
        name: p.product_name,
        description: `Premium ${p.category} from ${p.brand}. Experience the best performance in the electronics market.`,
        features: parsedFeatures,
        brand: p.brand,
        price: p.price_INR,
        category: p.category,
        images: [{ url: p.image_url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", public_id: p.product_id }],
        stock: 100,
        ratings: p.average_rating,
        numOfReviews: p.total_reviews,
        smartScore: p.trending_score ? Math.min(Math.round(p.trending_score * 40), 100) : 75, // Adjusting scale since their trending score looked like integers or small decimals e.g 1.43
        trendingScore: p.trending_score,
        reviews: prodReviews,
        createdAt: new Date()
      };
    });

    // 5. Insert
    await Product.insertMany(dbPayload);
    console.log(`✅ Successfully seeded ${dbPayload.length} Products with mapped Excel relationships!`);
    
    process.exit();
  })
  .catch(err => {
    console.error("Migration Error:", err);
    process.exit(1);
  });
