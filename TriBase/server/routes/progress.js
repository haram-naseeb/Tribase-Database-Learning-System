const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getUserProgress, markLessonComplete } = require('../controllers/progressController');

router.use(authMiddleware);
router.get('/', getUserProgress);
router.post('/complete', markLessonComplete);

module.exports = router;
