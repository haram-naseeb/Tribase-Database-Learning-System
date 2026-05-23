const { pool } = require('../db/postgres');
const { getCachedLeaderboard, setCachedLeaderboard } = require('../db/cache');

// GET /api/leaderboard/global
const getGlobalLeaderboard = async (req, res) => {
  try {
    const cached = getCachedLeaderboard();
    if (cached) return res.json(cached);

    const result = await pool.query(`
      SELECT u.id, u.name, u.xp, u.level,
             COUNT(p.id) AS lessons_completed
      FROM platform_users u
      LEFT JOIN user_progress p ON p.user_id = u.id
      GROUP BY u.id, u.name, u.xp, u.level
      ORDER BY u.xp DESC LIMIT 100
    `);

    const leaderboard = result.rows.map((row, idx) => ({ ...row, rank: idx + 1 }));
    setCachedLeaderboard(leaderboard);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching leaderboard.' });
  }
};

// GET /api/leaderboard/db/:dbType
const getDbLeaderboard = async (req, res) => {
  const { dbType } = req.params;
  const valid = ['postgres', 'mongo', 'neo4j'];
  if (!valid.includes(dbType)) return res.status(400).json({ error: 'Invalid DB type.' });

  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.xp, u.level,
             COUNT(p.id) AS lessons_completed
      FROM platform_users u
      LEFT JOIN user_progress p ON p.user_id = u.id AND p.db_type = $1
      GROUP BY u.id, u.name, u.xp, u.level
      ORDER BY lessons_completed DESC, u.xp DESC LIMIT 100
    `, [dbType]);

    res.json(result.rows.map((row, idx) => ({ ...row, rank: idx + 1 })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching leaderboard.' });
  }
};

module.exports = { getGlobalLeaderboard, getDbLeaderboard };

