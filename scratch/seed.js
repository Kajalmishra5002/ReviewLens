const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });
const Product = require('../backend/models/Product');
const { dummyProducts } = require('../backend/data/dummyData');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check if products exist
        const count = await Product.countDocuments();
        if (count > 0) {
            console.log(`DB already has ${count} products. Skipping seeding.`);
        } else {
            console.log('Seeding dummy products...');
            await Product.insertMany(dummyProducts);
            console.log('Seeding complete!');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedDB();
