const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../db/cache');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const token = authHeader.replace('Bearer ', '');
    if (isBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been invalidated. Please log in again.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'learndb_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
