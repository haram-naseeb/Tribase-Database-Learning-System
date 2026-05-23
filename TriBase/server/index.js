const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectMongo } = require('./db/mongo');
const { connectNeo4j } = require('./db/neo4j');
const initDatabase = require('./db/init');
const { initSandbox } = require('./db/sandboxManager');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Initialize all connections and tables, then start server
const start = async () => {
  await connectMongo();
  await connectNeo4j();
  await initDatabase();
  await initSandbox(); // Fresh sandbox on every start

  // Routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/queries', require('./routes/queries'));
  app.use('/api/progress', require('./routes/progress'));
  app.use('/api/leaderboard', require('./routes/leaderboard'));
  app.use('/api/schema', require('./routes/schema'));

  // Health check
  app.get('/health', async (req, res) => {
    const { pool } = require('./db/postgres');
    let pgOk = false;
    try { await pool.query('SELECT 1'); pgOk = true; } catch(e) {}
    res.json({
      status: 'ok',
      postgres: pgOk ? 'connected' : 'disconnected',
      mongo: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
      neo4j: process.env.NEO4J_ENABLED === 'true' ? 'enabled' : 'disabled',
    });
  });

  app.listen(PORT, () => console.log(`\nTribase API running at http://localhost:${PORT}\n`));
};

start();
