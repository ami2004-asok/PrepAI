const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt connecting to configured MONGO_URI with a 2-second timeout
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed on ${process.env.MONGO_URI} (${error.message}).`);
    console.log('⚡ Starting in-memory MongoDB server fallback for seamless database functionality...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`✅ In-Memory MongoDB connected successfully at: ${conn.connection.host}`);
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB fallback:', memErr.message);
    }
  }
};

module.exports = connectDB;
