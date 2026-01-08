const GameState = require('../models/GameState');

// Get current game state
const getGameState = async (req, res) => {
  try {
    let gameState = await GameState.findOne();
    
    if (!gameState) {
      gameState = new GameState();
      await gameState.save();
    }

    // Calculate remaining time from backend if contest is running
    if (gameState.contestStarted && gameState.timerRunning && gameState.startTime) {
      const elapsed = Math.floor((Date.now() - new Date(gameState.startTime).getTime()) / 1000);
      const remaining = Math.max(0, gameState.timerSeconds - elapsed);
      
      // If time ran out, stop the contest
      if (remaining === 0 && gameState.contestStarted) {
        gameState.contestStarted = false;
        gameState.timerRunning = false;
        gameState.timerSeconds = 0;
        gameState.endTime = new Date();
        await gameState.save();
      } else {
        // Return calculated time without saving (read-only calculation)
        gameState = gameState.toObject();
        gameState.timerSeconds = remaining;
      }
    }

    res.json({ success: true, gameState });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ error: 'Server error fetching game state' });
  }
};

// Update game state (Chief only)
const updateGameState = async (req, res) => {
  try {
    const { contestStarted, timerRunning, timerSeconds } = req.body;
    
    let gameState = await GameState.findOne();
    
    if (!gameState) {
      gameState = new GameState();
    }

    if (contestStarted !== undefined) gameState.contestStarted = contestStarted;
    if (timerRunning !== undefined) gameState.timerRunning = timerRunning;
    if (timerSeconds !== undefined) gameState.timerSeconds = timerSeconds;
    
    gameState.updatedAt = new Date();
    
    if (contestStarted && !gameState.startTime) {
      gameState.startTime = new Date();
    }

    await gameState.save();

    res.json({ success: true, gameState });
  } catch (error) {
    console.error('Update game state error:', error);
    res.status(500).json({ error: 'Server error updating game state' });
  }
};

// Start contest
const startContest = async (req, res) => {
  try {
    const { timerSeconds } = req.body;
    
    let gameState = await GameState.findOne();
    
    if (!gameState) {
      gameState = new GameState();
    }

    const duration = timerSeconds || 3600; // Default 1 hour
    gameState.contestStarted = true;
    gameState.timerRunning = true;
    gameState.timerSeconds = duration; // Store initial duration
    gameState.startTime = new Date();
    gameState.updatedAt = new Date();
    gameState.endTime = null;

    await gameState.save();

    res.json({ success: true, gameState });
  } catch (error) {
    console.error('Start contest error:', error);
    res.status(500).json({ error: 'Server error starting contest' });
  }
};

// Stop contest
const stopContest = async (req, res) => {
  try {
    let gameState = await GameState.findOne();
    
    if (!gameState) {
      return res.status(404).json({ error: 'Game state not found' });
    }

    gameState.contestStarted = false;
    gameState.timerRunning = false;
    gameState.endTime = new Date();
    gameState.updatedAt = new Date();

    await gameState.save();

    res.json({ success: true, gameState });
  } catch (error) {
    console.error('Stop contest error:', error);
    res.status(500).json({ error: 'Server error stopping contest' });
  }
};

module.exports = {
  getGameState,
  updateGameState,
  startContest,
  stopContest
};
