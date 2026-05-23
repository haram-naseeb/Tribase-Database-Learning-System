const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getPostgresSchema, getPostgresTable,
  getMongoSchema, getMongoCollection,
  getNeo4jSchema, getNeo4jNodeSample
} = require('../controllers/schemaController');

router.use(authMiddleware);
router.get('/postgres', getPostgresSchema);
router.get('/postgres/table/:tableName', getPostgresTable);
router.get('/mongo', getMongoSchema);
router.get('/mongo/collection/:collectionName', getMongoCollection);
router.get('/neo4j', getNeo4jSchema);
router.get('/neo4j/node/:label', getNeo4jNodeSample);

module.exports = router;
