const { createClient } = require('redis');
require('dotenv').config({ path: '../.env' });

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://:learndb_redis_password@localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis Connected');
  } catch (err) {
    console.error('Redis connection error:', err.message);
  }
};

connectRedis();

module.exports = redisClient;
