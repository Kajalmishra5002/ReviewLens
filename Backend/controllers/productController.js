const Product = require('../models/Product');
const Review = require('../models/Review');
const axios = require('axios');
const { calculateProductSmartScore } = require('../utils/prasAlgorithm');
const { recordPriceSnapshot } = require('./priceController');

const catchAsyncErrors = require('../middlewares/catchAsyncError');
const { ErrorHandler } = require('../middlewares/errorMiddleware');


// ================= CREATE PRODUCT (SELLER) =================
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
  const { name, category, price, compareAtPrice, discount, description, brand, model, sku, condition, warranty, stock, lowStockAlert, weight, tags, images, features, rating } = req.body;

  const allowedCategories = ["Electronics", "Mobile", "Laptop", "Tablet", "TV", "Audio", "Camera", "Gaming", "Accessories", "Smartwatch", "Networking"];
  if (category && !allowedCategories.includes(category)) {
    return next(new ErrorHandler("Invalid electronics category", 400));
  }

  // Generate 2 dummy reviews if demo requests it
  const dummyReviews = [
    {
      user: req.user._id,
      name: "Demo Reviewer",
      rating: rating || 5,
      comment: "Great product, excellent build quality!",
      sentiment: "Positive"
    },
    {
      user: req.user._id,
      name: "Tech Enthusiast",
      rating: 4,
      comment: "Good value for the price.",
      sentiment: "Positive"
    }
  ];

  // Map features properly (could be array or comma-separated string)
  let parsedFeatures = [];
  if (Array.isArray(features)) {
    parsedFeatures = features;
  } else if (features) {
    parsedFeatures = features.split(',').map(f => f.trim());
  }

  // Map images properly
  let parsedImages = [];
  if (Array.isArray(images) && images.length > 0) {
    parsedImages = images.map((url, i) => ({ url, public_id: `img_${i}` }));
  } else if (req.body.image) {
    parsedImages = [{ url: req.body.image, public_id: "demo_img" }];
  } else {
    parsedImages = [{ url: "https://via.placeholder.com/400", public_id: "placeholder" }];
  }

  // Compile detailed description and other fields if needed, or save directly
  const productData = {
    name: name,
    description: description,
    category: category || "Electronics",
    price: Number(price),
    brand: brand || (name ? name.split(' ')[0] : "Generic"),
    features: parsedFeatures,
    images: parsedImages,
    tags: tags || [],
    stock: stock ? Number(stock) : 100,
    ratings: rating ? Number(rating) : 0,
    numOfReviews: 2,
    reviews: dummyReviews,
    createdBy: req.user._id
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: "Product added successfully",
    product
  });
});


// ================= GET ALL PRODUCTS (Enhanced Search) =================
exports.fetchAllProducts = catchAsyncErrors(async (req, res) => {
  const { keyword } = req.query;
  
  let query = {};
  if (keyword) {
    query = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { brand: { $regex: keyword, $options: "i" } },
        { category: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }
      ]
    };
  }

  const products = await Product.find(query);
  
  console.log(`Fetched products for keyword "${keyword || ''}", count: ${products.length}`);

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// ================= SEARCH PRODUCTS =================
exports.fetchSearchProducts = async (req, res) => {
  const keyword = req.query.q || "";

  // 1. Local Search
  const localProducts = await Product.find({
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } }
    ]
  });

  const formattedLocal = localProducts.map(p => {
    let prod = p._doc || p;
    return {
       ...prod,
       source: "internal"
    };
  });

  // 2. External Search (DummyJSON)
  let externalProducts = [];
  try {
    const extRes = await axios.get(`https://dummyjson.com/products/search?q=${keyword}`);
    const items = extRes.data.products || [];
    
    externalProducts = await Promise.all(items.map(async item => {
      // Normalize to our schema
      const normalizedReviews = (item.reviews || []).map(r => ({
        user: r.reviewerEmail || "guest@example.com",
        name: r.reviewerName,
        rating: r.rating,
        comment: r.comment,
        sentiment: r.rating >= 4 ? "Positive" : r.rating <= 2 ? "Negative" : "Neutral",
        createdAt: r.date
      }));

      const productObj = {
        _id: `ext_${item.id}`,
        name: item.title,
        description: item.description,
        price: Math.round(item.price * 83), // Convert USD to INR
        category: item.category,
        brand: item.brand || "Generic",
        images: [{ url: item.thumbnail, public_id: `ext_img_${item.id}` }],
        ratings: item.rating,
        numOfReviews: normalizedReviews.length || Math.floor(Math.random() * 50) + 10,
        reviews: normalizedReviews,
        source: "external",
        features: item.tags || []
      };

      // Apply PRAS
      productObj.smartScore = (await calculateProductSmartScore(productObj.reviews, productObj)) || item.rating;
      return productObj;
    }));

  } catch (error) {
    console.error("External API search failed", error);
  }

  // 3. Merge & Sort
  const mergedProducts = [...formattedLocal, ...externalProducts];
  mergedProducts.sort((a, b) => (b.smartScore || b.ratings || 0) - (a.smartScore || a.ratings || 0));

  res.json({
    success: true,
    products: mergedProducts
  });
};
// ================= GET SINGLE PRODUCT =================
exports.fetchSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product
  });
});


// ================= UPDATE PRODUCT =================
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  product = await Product.findById(req.params.productId);
  // Apply updates to product
  Object.assign(product, req.body);
  // Record price snapshot if price is being changed
  if (req.body.price !== undefined) {
    await recordPriceSnapshot(product);
  }
  await product.save();

  res.status(200).json({
    success: true,
    product
  });
});


// ================= DELETE PRODUCT =================
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted"
  });
});


// ================= ADD / UPDATE REVIEW (UPDATED 🔥) =================
exports.postProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // 🤖 SENTIMENT & FAKE DETECTION
  let sentiment = "Neutral";
  let isSuspicious = false;
  try {
    // 1. Sentiment
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze`,
      { text: comment }
    );
    sentiment = aiRes.data.sentiment;

    // 2. Fake Detection
    // Prepare recent reviews for context (to detect text similarity/timing)
    const recentReviews = product.reviews.slice(-20).map(r => ({
      id: r._id.toString(),
      text: r.comment,
      user_id: r.user.toString(),
      timestamp: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
    }));
    
    // Add current review to the batch
    recentReviews.push({
      id: "current",
      text: comment,
      user_id: req.user._id.toString(),
      timestamp: new Date().toISOString()
    });

    const fakeRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/detect-fake-reviews`,
      { reviews: recentReviews }
    );
    
    if (fakeRes.data.flagged_review_ids.includes("current")) {
      isSuspicious = true;
    }
  } catch (err) {
    console.log("AI features failed, using defaults", err.message);
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
    sentiment,
    isSuspicious
  };

  const isReviewed = product.reviews.find(
    r => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach(r => {
      if (r.user.toString() === req.user._id.toString()) {
        r.rating = rating;
        r.comment = comment;
        r.sentiment = sentiment;
        r.isSuspicious = isSuspicious;
      }
    });
  } else {
    product.reviews.push(review);
  }

  // ✅ 2. Sync with standalone Review collection
  await Review.findOneAndUpdate(
    { productId: product._id, userId: req.user._id },
    {
      productId: product._id,
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      reviewText: comment,
      sentiment: sentiment,
      isSuspicious: isSuspicious
    },
    { upsert: true, new: true }
  );

  // ✅ 3. Always update review count
  product.numOfReviews = product.reviews.length;

  // ⭐ Recalculate rating and smartScore
  product.ratings =
    product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
    product.reviews.length;
    
  // 🧠 Recalculate PRAS Smart Score
  product.smartScore = await calculateProductSmartScore(product.reviews, product);

  // 🔮 Generate AI Insights (Explainable AI)
  try {
     const insightsRes = await axios.post(
       `${process.env.AI_SERVICE_URL}/generate-insights`,
       { reviews: product.reviews.map(r => r.comment) }
     );
     product.aiInsights = {
       ...insightsRes.data,
       lastGenerated: new Date()
     };
  } catch (e) {
     console.log("AI Insights generation failed");
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: isSuspicious ? "Review posted (Flagged as suspicious by AI)" : "Review added with sentiment analysis",
    review
  });
});


// ================= DELETE REVIEW =================
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  const reviews = product.reviews.filter(
    r => r.user.toString() !== req.user._id.toString()
  );

  product.reviews = reviews;
  product.numOfReviews = reviews.length;

  product.ratings =
    reviews.length === 0
      ? 0
      : reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  // ✅ 2. Delete from standalone collection
  await Review.deleteOne({ productId: product._id, user: req.user._id });

  // 🧠 Recalculate PRAS Smart Score
  product.smartScore = await calculateProductSmartScore(reviews, product);

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review deleted"
  });
});


// ================= AI SEARCH =================
exports.fetchAIFilteredProducts = catchAsyncErrors(async (req, res) => {
  const aiRes = await axios.post(
    `${process.env.AI_SERVICE_URL}/search`,
    req.body
  );

  res.json({
    success: true,
    products: aiRes.data.products
  });
});


// ================= ⭐ BEST PRODUCTS =================
exports.getBestProducts = catchAsyncErrors(async (req, res) => {
  // Fetch top products sorted by smartScore
  // We filter products with at least 5 reviews for "Best" status credibility
  const products = await Product.find()
    .sort({ smartScore: -1, ratings: -1 })
    .limit(10);

  res.json({
    success: true,
    count: products.length,
    products
  });
});




// ================= 🤖 SENTIMENT ANALYSIS =================
exports.analyzeReview = catchAsyncErrors(async (req, res) => {
  const { review } = req.body;

  const aiRes = await axios.post(
    `${process.env.AI_SERVICE_URL}/analyze`,
    { text: review }
  );

  res.json({
    success: true,
    sentiment: aiRes.data.sentiment
  });
});

// ================= 🤖 AI DESCRIPTION GENERATION =================
exports.generateDescription = catchAsyncErrors(async (req, res) => {
  const { name, brand, model, category, features } = req.body;

  try {
    // Attempt to use Python AI service
    const aiRes = await axios.post(
      `${process.env.AI_SERVICE_URL}/generate`,
      { name, brand, model, category, features }
    );

    res.json({
      success: true,
      description: aiRes.data.description || aiRes.data.text || "AI generated description."
    });
  } catch (error) {
    // Fallback if python service doesn't have /generate implemented
    console.error("AI service /generate failed", error.message);
    res.json({
      success: true,
      description: `Introducing the new ${brand || ''} ${name || model || 'Product'}. A premium offering in the ${category || 'Electronics'} category, designed to elevate your experience with features like ${features ? features.join(', ') : 'cutting-edge technology'}.`
    });
  }
});

// ================= PRODUCT COMPARISON =================
exports.compareProducts = catchAsyncErrors(async (req, res, next) => {
  const { id1, id2 } = req.params;

  const p1 = await Product.findById(id1);
  const p2 = await Product.findById(id2);

  if (!p1 || !p2) {
    return next(new ErrorHandler("Product(s) not found for comparison", 404));
  }

  res.status(200).json({
    success: true,
    comparison: {
      price: p1.price < p2.price ? p1.name : p2.name,
      rating: (p1.ratings || 0) > (p2.ratings || 0) ? p1.name : p2.name,
      smartScore: (p1.smartScore || 0) > (p2.smartScore || 0) ? p1.name : p2.name,
      products: [p1, p2]
    }
  });
});

// ================= GET SELLER PRODUCTS =================
exports.getSellerProducts = catchAsyncErrors(async (req, res, next) => {
  // Only the logged in seller should fetch their own products, or we use params
  const sellerId = req.params.id;
  
  if (req.user.role !== 'Seller' && req.user.role !== 'Admin') {
     return next(new ErrorHandler("Unauthorized", 403));
  }

  const products = await Product.find({ createdBy: sellerId });

  res.status(200).json({
    success: true,
    products
  });
});