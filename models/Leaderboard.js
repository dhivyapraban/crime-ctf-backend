const mongoose = require('mongoose');

const solvedCaseSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  solvedAt: { type: Date, default: Date.now }
});

const usedHintSchema = new mongoose.Schema({
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  hintId: String,
  usedAt: { type: Date, default: Date.now }
});

const leaderboardSchema = new mongoose.Schema({
  detectiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'Detective', required: true },
  detectiveName: { type: String, required: true },
  score: { type: Number, default: 0 },
  solvedCases: [solvedCaseSchema],
  usedHints: [usedHintSchema],
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
