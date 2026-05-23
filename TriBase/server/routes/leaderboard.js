const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getDbLeaderboard } = require('../controllers/leaderboardController');

router.get('/global', getGlobalLeaderboard);
router.get('/db/:dbType', getDbLeaderboard);

module.exports = router;
