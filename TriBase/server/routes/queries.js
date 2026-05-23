const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');
const { executePostgresQuery, executeMongoQuery, executeNeo4jQuery } = require('../controllers/queryController');

const queryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Rate limit: max 30 queries/minute. Please wait.' }
});

router.use(authMiddleware);
router.use(queryLimiter);
router.post('/postgres', executePostgresQuery);
router.post('/mongo', executeMongoQuery);
router.post('/neo4j', executeNeo4jQuery);

module.exports = router;
