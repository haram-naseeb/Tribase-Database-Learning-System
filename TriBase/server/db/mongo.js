const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

let isConnected = false;

const connectMongo = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/learndb_social';
    await mongoose.connect(uri);
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('MongoDB features will be unavailable');
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectMongo, getIsConnected };
