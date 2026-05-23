const { pool } = require('../db/postgres');

// GET /api/progress
const getUserProgress = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT db_type, lesson_id, xp_earned, completed_at FROM user_progress WHERE user_id = $1 ORDER BY completed_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching progress.' });
  }
};

// POST /api/progress/complete
const markLessonComplete = async (req, res) => {
  const { db_type, lesson_id, xp_awarded = 10 } = req.body;
  if (!db_type || !lesson_id) return res.status(400).json({ error: 'db_type and lesson_id are required.' });

  try {
    // Check if already completed
    const exists = await pool.query(
      'SELECT id FROM user_progress WHERE user_id = $1 AND db_type = $2 AND lesson_id = $3',
      [req.user.id, db_type, lesson_id]
    );
    if (exists.rows.length > 0) return res.json({ message: 'Already completed.', already_done: true });

    await pool.query(
      'INSERT INTO user_progress (user_id, db_type, lesson_id, xp_earned) VALUES ($1, $2, $3, $4)',
      [req.user.id, db_type, lesson_id, xp_awarded]
    );
    await pool.query('UPDATE platform_users SET xp = xp + $1 WHERE id = $2', [xp_awarded, req.user.id]);

    // Update level (every 100 XP = 1 level)
    const userResult = await pool.query('SELECT xp FROM platform_users WHERE id = $1', [req.user.id]);
    const newXP = userResult.rows[0].xp;
    const newLevel = Math.floor(newXP / 100) + 1;
    await pool.query('UPDATE platform_users SET level = $1 WHERE id = $2', [newLevel, req.user.id]);

    res.json({ message: 'Progress saved!', xp_awarded, new_xp: newXP, new_level: newLevel });
  } catch (err) {
    console.error('Progress error:', err.message);
    res.status(500).json({ error: 'Error saving progress.' });
  }
};

module.exports = { getUserProgress, markLessonComplete };
