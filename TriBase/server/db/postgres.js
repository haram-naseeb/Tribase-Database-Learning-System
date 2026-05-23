const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'learndb_admin',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'learndb',
  password: process.env.POSTGRES_PASSWORD || 'learndb_password',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => console.log('PostgreSQL Connected'));
pool.on('error', (err) => console.error('PostgreSQL Pool Error:', err.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
