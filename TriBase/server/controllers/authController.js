const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/postgres');
const { blacklistToken } = require('../db/cache');

const signToken = (user) => jwt.sign(
  { id: user.id, email: user.email, name: user.name },
  process.env.JWT_SECRET || 'learndb_secret',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

// POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  try {
    const existing = await pool.query('SELECT id FROM platform_users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO platform_users (name, email, password, last_login) 
       VALUES ($1, $2, $3, CURRENT_DATE) 
       RETURNING id, name, email, xp, level, streak`,
      [name, email, hashed]
    );
    const user = result.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });

  try {
    const result = await pool.query('SELECT * FROM platform_users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password.' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password.' });

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = user.last_login ? user.last_login.toISOString().split('T')[0] : null;
    let streak = user.streak || 0;
    if (lastLogin) {
      const diff = (new Date(today) - new Date(lastLogin)) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak += 1;
      else if (diff > 1) streak = 1;
    } else {
      streak = 1;
    }
    await pool.query('UPDATE platform_users SET last_login = $1, streak = $2, xp = xp + 5 WHERE id = $3',
      [today, streak, user.id]);

    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, xp: user.xp + 5, level: user.level, streak, created_at: user.created_at } });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) blacklistToken(token);
  res.json({ message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, xp, level, streak, created_at, country, is_premium FROM platform_users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { register, login, logout, getMe };
