const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
  contestStarted: { type: Boolean, default: false },
  timerRunning: { type: Boolean, default: false },
  timerSeconds: { type: Number, default: 0 },
  startTime: Date,
  endTime: Date,
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GameState', gameStateSchema);
