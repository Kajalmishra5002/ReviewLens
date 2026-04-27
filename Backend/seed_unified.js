require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');

const Product = require('./models/Product');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB -> Loading Unified Excel Database...");

    // 1. Read Excel file
    const workbook = xlsx.readFile('../data/ReviewLens_Unified_Dataset.xlsx');
    
    // Parse sheets
    const productsData = xlsx.utils.sheet_to_json(workbook.Sheets['🛒 Master Products']);
    const reviewsData = xlsx.utils.sheet_to_json(workbook.Sheets['📝 Enriched Reviews']);

    console.log(`Parsed ${productsData.length} products and ${reviewsData.length} reviews from Excel.`);

    // 2. Clear existing DB
    await Product.deleteMany({});
    console.log("Cleared old product catalog.");

    // Create a dummy user ObjectId to fulfill strict ref constraints
    let dummyUser = await User.findOne({ email: "systems@reviewlens.com" });
    if (!dummyUser) {
      dummyUser = await User.create({
        name: "ReviewLens System Account",
        email: "systems@reviewlens.com",
        password: "hashed_dummy_password",
        role: "User"
      });
    }

    // Unsplash tech images pool for fallback
    const imagePool = [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", // Watch
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", // Phone
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80", // Laptop/Tech
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80", // Headphones
      "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?w=500&q=80"  // Gadgets
    ];

    // 3. Transform Products and Embed Reviews
    const dbPayload = productsData.map((p, index) => {
      // Find matching reviews
      const prodReviews = reviewsData
        .filter(r => r['Product ID'] === p['ID'])
        .map(r => {
          let date;
          // Excel dates can be numeric serials or strings
          if (typeof r['Date'] === 'number') {
            date = new Date((r['Date'] - (25567 + 1)) * 86400 * 1000);
          } else {
            date = new Date(r['Date'] || Date.now());
          }
          if (isNaN(date.getTime())) date = new Date(); // Failsafe

          return {
            user: dummyUser._id,
            name: r['Reviewer'] || "Verified Buyer",
            rating: r['Stars ★'] || 5,
            comment: r['Review Text'] || "No text provided",
            sentiment: r['Sentiment'] || "Neutral",
            createdAt: date
          };
        });

      return {
        name: p['Product Name'],
        description: `Premium ${p['Category']} from ${p['Brand']}. Verdict: ${p['Overall Verdict'] || 'Great product.'}`,
        features: p['Category'] ? [p['Category'], "Premium Build", "AI Verified"] : [],
        brand: p['Brand'] || "Generic",
        price: p['Disc. Price (₹)'] || p['Price (₹)'],
        category: p['Category'] || "Electronics",
        images: [{ 
          url: imagePool[index % imagePool.length], 
          public_id: `prod_${p['ID']}` 
        }],
        stock: p['In Stock'] ? 100 : 0,
        ratings: p['Rating ★'] || 0,
        numOfReviews: p['Reviews'] || prodReviews.length,
        smartScore: p['Smart Score'] || 75,
        trendingScore: p['Trending Score'] || 0,
        amazonLink: p['Buy Link'] || null,
        reviews: prodReviews,
        createdBy: dummyUser._id,
        createdAt: new Date()
      };
    });

    // 4. Insert into DB
    await Product.insertMany(dbPayload);
    console.log(`✅ Successfully seeded ${dbPayload.length} Products with mapped reviews from Unified Dataset!`);
    
    process.exit();
  })
  .catch(err => {
    console.error("Migration Error:", err);
    process.exit(1);
  });
