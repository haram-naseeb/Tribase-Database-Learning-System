require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

// In-memory token blacklist (replaces Redis for JWT logout)
const tokenBlacklist = new Map();
const leaderboardCache = { data: null, timestamp: 0 };
const CACHE_TTL = 60 * 1000; // 60 seconds

const isBlacklisted = (token) => tokenBlacklist.has(token);

const blacklistToken = (token) => {
  tokenBlacklist.set(token, Date.now());
  // Cleanup old tokens every hour
  if (tokenBlacklist.size > 1000) {
    const oneDay = 24 * 60 * 60 * 1000;
    for (const [key, val] of tokenBlacklist) {
      if (Date.now() - val > oneDay) tokenBlacklist.delete(key);
    }
  }
};

const getCachedLeaderboard = () => {
  if (leaderboardCache.data && Date.now() - leaderboardCache.timestamp < CACHE_TTL) {
    return leaderboardCache.data;
  }
  return null;
};

const setCachedLeaderboard = (data) => {
  leaderboardCache.data = data;
  leaderboardCache.timestamp = Date.now();
};

module.exports = { isBlacklisted, blacklistToken, getCachedLeaderboard, setCachedLeaderboard };
