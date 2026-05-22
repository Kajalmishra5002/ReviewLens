const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const BRANDS = ["Apple", "Samsung", "Sony", "Dell", "HP", "LG", "Asus", "OnePlus", "Xiaomi", "Bose", "Sennheiser", "Microsoft", "Canon", "Nikon", "GoPro"];
const CATEGORIES = ["Smartphones", "Laptops", "TVs", "Tablets", "Headphones"];

const POSITIVE_PHRASES = [
    "Amazing product, really worth the price.",
    "Best in class performance. I am impressed.",
    "The camera quality is just mind-blowing.",
    "Battery life is great, easily lasts 2 days.",
    "Very sleek design and premium feel.",
    "Fast delivery and original product.",
    "Highly recommended for students.",
    "Great value for money.",
    "Smooth user interface and no lag.",
    "Perfect for gaming and multitasking."
];

const NEGATIVE_PHRASES = [
    "Overheating issues after 30 mins of use.",
    "Battery drains very fast.",
    "Build quality is not up to the mark.",
    "Camera is average, not worth the hype.",
    "Display started flickering within a week.",
    "Very slow charging.",
    "Price is too high for these features.",
    "Customer support is pathetic.",
    "Not recommended for professional use.",
    "Too many bugs in the software."
];

const GENERIC_FAKE_PHRASES = [
    "best product ever",
    "must buy",
    "awesome product",
    "very good very good very good",
    "don't think just buy",
    "Highly recommended for all",
    "Super fast delivery best quality"
];

const NAMES = ["Rahul", "Anjali", "Vikram", "Sneha", "Amit", "Priya", "Karan", "Sonia", "Deepak", "Riya", "John", "Sarah", "David", "Emily", "Michael"];

const generateProduct = (id) => {
    const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const name = `${brand} ${category.slice(0, -1)} Pro ${id}`;
    const price = Math.floor(Math.random() * 150000) + 5000;
    
    const reviews = [];
    let posCount = 0, negCount = 0, neuCount = 0;
    const numReviews = Math.floor(Math.random() * 31) + 20;

    for (let i = 0; i < numReviews; i++) {
        const isFake = Math.random() < 0.15; // 15% fake reviews
        let rating, reviewText, sentiment;

        if (isFake) {
            rating = Math.random() < 0.8 ? 5 : 1; // Fakes are usually extreme
            reviewText = GENERIC_FAKE_PHRASES[Math.floor(Math.random() * GENERIC_FAKE_PHRASES.length)];
            if (Math.random() < 0.3) reviewText = reviewText.repeat(3); // Make it repetitive
            sentiment = rating === 5 ? "Positive" : "Negative";
        } else {
            const rand = Math.random();
            if (rand < 0.6) {
                rating = Math.floor(Math.random() * 2) + 4; // 4-5
                reviewText = POSITIVE_PHRASES[Math.floor(Math.random() * POSITIVE_PHRASES.length)];
                sentiment = "Positive";
            } else if (rand < 0.9) {
                rating = Math.floor(Math.random() * 2) + 1; // 1-2
                reviewText = NEGATIVE_PHRASES[Math.floor(Math.random() * NEGATIVE_PHRASES.length)];
                sentiment = "Negative";
            } else {
                rating = 3;
                reviewText = "Average product. Does the job but nothing special.";
                sentiment = "Neutral";
            }
        }

        if (sentiment === "Positive") posCount++;
        else if (sentiment === "Negative") negCount++;
        else neuCount++;

        reviews.push({
            userName: NAMES[Math.floor(Math.random() * NAMES.length)],
            rating,
            reviewText,
            sentiment,
            isFake,
            fakeScore: isFake ? Math.floor(Math.random() * 41) + 60 : Math.floor(Math.random() * 30),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
        });
    }

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    return {
        name,
        category,
        brand,
        price,
        rating: Number(avgRating.toFixed(1)),
        description: `Premium ${brand} ${category} with latest technology and sleek design. Perfect for your daily needs.`,
        features: ["High Performance", "Long Battery Life", "Premium Build", "Latest AI Features"],
        image: `https://images.unsplash.com/photo-15${Math.floor(Math.random()*99999)}?w=600`,
        amazonLink: `https://amazon.in/s?k=${encodeURIComponent(name)}`,
        flipkartLink: `https://flipkart.com/search?q=${encodeURIComponent(name)}`,
        reviews,
        stats: {
            totalReviews: reviews.length,
            positiveReviews: posCount,
            negativeReviews: negCount,
            neutralReviews: neuCount
        }
    };
};

const products = [];
for (let i = 1; i <= 200; i++) {
    products.push(generateProduct(i));
}

// 1. JSON Export
const jsonPath = path.join(__dirname, '..', 'data', 'products_dataset.json');
if (!fs.existsSync(path.dirname(jsonPath))) fs.mkdirSync(path.dirname(jsonPath));
fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));

// 2. MongoDB Import Format (Newline delimited JSON)
const mongoPath = path.join(__dirname, '..', 'data', 'products_mongo.json');
const mongoData = products.map(p => JSON.stringify(p)).join('\n');
fs.writeFileSync(mongoPath, mongoData);

// 3. XLSX Export
const flattenedData = products.map(p => ({
    Name: p.name,
    Category: p.category,
    Brand: p.brand,
    Price: p.price,
    Rating: p.rating,
    TotalReviews: p.stats.totalReviews,
    Positive: p.stats.positiveReviews,
    Negative: p.stats.negativeReviews,
    Neutral: p.stats.neutralReviews
}));

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(flattenedData);
XLSX.utils.book_append_sheet(wb, ws, "Products");
XLSX.writeFile(wb, path.join(__dirname, '..', 'data', 'products_dataset.xlsx'));

console.log("Dataset generation complete!");
console.log(`JSON: ${jsonPath}`);
console.log(`Mongo: ${mongoPath}`);
console.log(`XLSX: ${path.join(__dirname, '..', 'data', 'products_dataset.xlsx')}`);
