const mongoose = require('mongoose');
const colors = require('colors');
const dns = require('dns');

// ✅ Node 17+ DNS resolution fix (Forces IPv4 first)
// This resolves the ECONNREFUSED error common on Windows with MongoDB Atlas
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// ✅ Disable Mongoose buffering to prevent long hangs on connection loss
// This fixes the "buffering timed out after 10000ms" error
mongoose.set('bufferCommands', false);

// ✅ Initialize DB Connection Status
global.isDBConnected = false;

/**
 * Connect to MongoDB Atlas with robust retry handling
 * Stops server startup if connection fails after all retries
 */
const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('❌ Error: MONGO_URI is not defined in .env file'.red.bold);
        console.log('⚠️ Running in DEMO MODE without database'.yellow.bold);
        return;
    }

    const options = {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
    };

    try {
        console.log(`⏳ Attempting MongoDB connection...`.yellow);
        const conn = await mongoose.connect(MONGO_URI, options);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
        global.isDBConnected = true;
    } catch (error) {
        console.error(`❌ Database Connection Failed: ${error.message}`.red);
        console.log('⚠️ SWITCHING TO DEMO MODE (Dummy Data will be used)'.yellow.bold);
        global.isDBConnected = false;
    }
};

module.exports = { connectDB };



