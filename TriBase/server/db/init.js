const { pool } = require('./postgres');

const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS platform_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        country VARCHAR(50) DEFAULT 'Unknown',
        is_premium BOOLEAN DEFAULT FALSE,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        last_login DATE
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES platform_users(id) ON DELETE CASCADE,
        db_type VARCHAR(20) NOT NULL,
        lesson_id VARCHAR(100) NOT NULL,
        xp_earned INTEGER DEFAULT 10,
        completed_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, db_type, lesson_id)
      );
    `);
    console.log('PostgreSQL tables initialized ✓');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
};

module.exports = initDatabase;
