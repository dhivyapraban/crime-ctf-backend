const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { authenticateToken } = require('../middleware/auth');

// Get leaderboard (accessible to all authenticated users)
router.get('/', authenticateToken, leaderboardController.getLeaderboard);

// Get my score (Detective only)
router.get('/my-score', authenticateToken, leaderboardController.getMyScore);

// Submit solution (Detective only)
router.post('/submit', authenticateToken, leaderboardController.submitSolution);

// Use hint (Detective only)
router.post('/use-hint', authenticateToken, leaderboardController.useHint);

module.exports = router;
