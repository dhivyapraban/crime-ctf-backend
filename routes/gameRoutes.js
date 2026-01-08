const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/auth');

// Get game state (accessible to all authenticated users)
router.get('/', authenticateToken, gameController.getGameState);

// Update game state (Chief only)
router.put('/', authenticateToken, gameController.updateGameState);

// Start contest (Chief only)
router.post('/start', authenticateToken, gameController.startContest);

// Stop contest (Chief only)
router.post('/stop', authenticateToken, gameController.stopContest);

module.exports = router;
