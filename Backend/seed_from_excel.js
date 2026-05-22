const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const Product = require('./models/Product');
const Review = require('./models/Review');
const User = require('./models/User');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * Extract brand from product name
 * @param {string} productName 
 * @returns {string}
 */
const extractBrand = (productName) => {
    if (!productName) return 'Unknown';
    // Common brands to look for specifically
    const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Bose', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Nikon', 'Canon', 'Microsoft', 'Nintendo', 'Logitech'];
    const found = brands.find(brand => productName.toLowerCase().includes(brand.toLowerCase()));
    if (found) return found;
    
    // Default to first word
    return productName.split(' ')[0];
};

/**
 * Seed database from Excel
 */
const seedFromExcel = async () => {
    try {
        // 1. Database Connection
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB.');

        // 2. Clear Existing Data
        console.log('🗑️  Clearing existing Products and Reviews...');
        await Product.deleteMany({});
        await Review.deleteMany({});
        console.log('✅ Collections cleared.');

        // 3. Find or Create Admin User (for createdBy field)
        let admin = await User.findOne({ role: 'Admin' });
        if (!admin) {
            admin = await User.create({
                name: 'Admin User',
                email: 'admin@reviewlens.com',
                password: 'adminpassword123', // In production, this should be hashed
                role: 'Admin',
                isVerified: true
            });
            console.log('👤 Created default Admin user.');
        }

        // 4. Create some mock users for reviews
        const reviewers = [];
        for (let i = 0; i < 5; i++) {
            let reviewer = await User.findOne({ email: `reviewer${i}@test.com` });
            if (!reviewer) {
                reviewer = await User.create({
                    name: `Reviewer ${i}`,
                    email: `reviewer${i}@test.com`,
                    password: 'password123',
                    isVerified: true
                });
            }
            reviewers.push(reviewer);
        }

        // 5. Read Excel File
        const filePath = path.join(__dirname, '..', 'data', 'Electronics_Dataset (2).xlsx');
        if (!require('fs').existsSync(filePath)) {
            throw new Error(`File not found at ${filePath}`);
        }

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        console.log(`📊 Found ${data.length} products in Excel.`);

        const productsToInsert = [];
        const reviewsToInsert = [];
        let totalReviewsCount = 0;

        // 6. Process Data
        for (const item of data) {
            const productName = item['Product Name'] || item['name'];
            const brand = extractBrand(productName);
            const category = item['Category'] || item['category'];
            const price = parseFloat(item['Price (INR)'] || item['Price'] || item['price'] || 0);
            const rating = parseFloat(item['Rating'] || item['rating'] || 0);
            
            // Map features
            const featuresStr = item['Key Features'] || item['Features'] || item['features'] || '';
            const features = featuresStr.split('|').map(f => f.trim()).filter(f => f);

            // Description from Pros/Cons
            const pros = item['Pros'] || item['pros'] || '';
            const cons = item['Cons'] || item['cons'] || '';
            const description = `${item['Sample Review'] || ''}\n\nPros: ${pros}\nCons: ${cons}`.trim();

            const productData = {
                name: productName,
                brand: brand,
                category: category,
                price: price,
                description: description,
                features: features,
                ratings: rating,
                images: [{ 
                    url: item['Image URL'] || item['image'] || 'https://via.placeholder.com/800', 
                    public_id: `excel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
                }],
                amazonLink: item['Amazon Link'] || item['amazonLink'],
                flipkartLink: item['Flipkart Link'] || item['flipkartLink'],
                createdBy: admin._id,
                stock: Math.floor(Math.random() * 50) + 10, // Random stock
                numOfReviews: parseInt(item['Total Reviews'] || item['totalReviewCount'] || 0),
                reviews: []
            };

            // 7. Generate Mock Reviews & Price History
            const posCount = parseInt(item['Positive Reviews'] || item['positiveReviewCount'] || 0);
            const negCount = parseInt(item['Negative Reviews'] || item['negativeReviewCount'] || 0);
            const neuCount = parseInt(item['Neutral Reviews'] || item['neutralReviewCount'] || 0);

            // Generate Price History (7 days)
            const priceHistory = [];
            for (let i = 7; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                // Slight random variation in price (±3%)
                const variation = (Math.random() * 0.06) - 0.03;
                priceHistory.push({
                    price: Math.round(price * (1 + variation)),
                    date: date
                });
            }
            productData.priceHistory = priceHistory;

            // Generate Reviews
            const generateReviews = (count, sentiment, text) => {
                const actualCount = Math.min(count, 5);
                for (let i = 0; i < actualCount; i++) {
                    const reviewer = reviewers[Math.floor(Math.random() * reviewers.length)];
                    const review = {
                        user: reviewer._id,
                        name: reviewer.name,
                        rating: sentiment === 'Positive' ? 5 : (sentiment === 'Negative' ? 1 : 3),
                        comment: text,
                        sentiment: sentiment,
                        isSuspicious: Math.random() < 0.05 // 5% chance of mock suspicious review
                    };
                    productData.reviews.push(review);
                }
            };

            generateReviews(posCount, 'Positive', 'Great product, highly recommended!');
            generateReviews(negCount, 'Negative', 'Not satisfied with the performance.');
            generateReviews(neuCount, 'Neutral', 'Average product, works as expected.');

            // 🧠 Initial Smart Score Calculation (Heuristic)
            const reviewsCount = productData.reviews.length;
            if (reviewsCount > 0) {
                const posActual = productData.reviews.filter(r => r.sentiment === 'Positive').length;
                const susActual = productData.reviews.filter(r => r.isSuspicious).length;
                const baseScore = (posActual / reviewsCount) * 5;
                const penalty = (susActual / reviewsCount) * 1.5;
                productData.smartScore = Math.max(0, Math.min(5, baseScore - penalty));
            } else {
                productData.smartScore = rating || 0;
            }

            // 🔮 Mock AI Insights
            productData.aiInsights = {
                summary: `Highly rated ${category} with strong ${brand} build quality. Users particularly like the performance.`,
                positiveHighlights: ["Performance", "Design", "Battery"],
                negativeHighlights: negCount > posCount ? ["Price", "Weight"] : [],
                lastGenerated: new Date()
            };

            productsToInsert.push(productData);
        }

        // 8. Bulk Insert Products
        const insertedProducts = await Product.insertMany(productsToInsert);
        
        // 9. Populate Standalone Reviews Collection
        insertedProducts.forEach(prod => {
            prod.reviews.forEach(rev => {
                reviewsToInsert.push({
                    productId: prod._id,
                    userId: rev.user,
                    name: rev.name,
                    rating: rev.rating,
                    reviewText: rev.comment,
                    sentiment: rev.sentiment
                });
            });
        });

        if (reviewsToInsert.length > 0) {
            await Review.insertMany(reviewsToInsert);
        }

        // 10. Summary
        console.log('\n✨ Seeding Summary:');
        console.log(`🚀 Total Products Inserted: ${insertedProducts.length}`);
        console.log(`💬 Total Mock Reviews Created: ${reviewsToInsert.length}`);
        console.log('✅ Success: Dataset fully integrated!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Seeding failed:');
        console.error(error.message);
        process.exit(1);
    }
};

seedFromExcel();