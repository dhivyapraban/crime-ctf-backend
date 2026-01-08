const Leaderboard = require('../models/Leaderboard');
const Case = require('../models/Case');
const bcrypt = require('bcrypt');

// Get leaderboard
const getLeaderboard = async (req, res) => {
  try {
    // In CTF: sort by score DESC, then by time ASC (earliest first for tiebreaker)
    const leaderboardEntries = await Leaderboard.find()
      .populate('detectiveId', 'username')
      .sort({ score: -1, lastUpdated: 1 })
      .limit(50);

    const formattedLeaderboard = leaderboardEntries.map((entry, index) => ({
      rank: index + 1,
      name: entry.detectiveName,
      score: entry.score,
      solvedCount: entry.solvedCases.length,
      time: entry.lastUpdated,
      lastUpdated: entry.lastUpdated
    }));

    res.json({ success: true, leaderboard: formattedLeaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
};

// Get detective's own score
const getMyScore = async (req, res) => {
  try {
    const detectiveId = req.user.id;
    
    let entry = await Leaderboard.findOne({ detectiveId });
    
    if (!entry) {
      const Detective = require('../models/Detective');
      const detective = await Detective.findById(detectiveId);
      
      if (!detective) {
        return res.status(404).json({ error: 'Detective not found. Please login again.' });
      }
      
      entry = new Leaderboard({
        detectiveId,
        detectiveName: detective.username,
        score: 0
      });
      await entry.save();
    }

    res.json({ success: true, score: entry });
  } catch (error) {
    console.error('Get my score error:', error);
    res.status(500).json({ error: 'Server error fetching score' });
  }
};

// Submit a case solution
const submitSolution = async (req, res) => {
  try {
    const detectiveId = req.user.id;
    const { caseId, flag } = req.body;

    if (!caseId || !flag) {
      return res.status(400).json({ error: 'Case ID and flag are required' });
    }

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Check if flag is correct using bcrypt comparison
    const isCorrectFlag = await bcrypt.compare(flag.trim(), caseItem.flag);
    if (!isCorrectFlag) {
      return res.status(400).json({ error: 'Incorrect flag', correct: false });
    }

    // Check if contest is still running
    const GameState = require('../models/GameState');
    const gameState = await GameState.findOne();
    if (gameState && !gameState.contestStarted) {
      return res.status(403).json({ error: 'Sorry, Contest Ended.' });
    }

    let entry = await Leaderboard.findOne({ detectiveId });
    
    if (!entry) {
      const Detective = require('../models/Detective');
      const detective = await Detective.findById(detectiveId);
      
      if (!detective) {
        return res.status(404).json({ error: 'Detective not found. Please login again.' });
      }
      
      entry = new Leaderboard({
        detectiveId,
        detectiveName: detective.username,
        score: 0
      });
    }

    // Check if already solved
    const alreadySolved = entry.solvedCases.some(sc => sc.caseId.toString() === caseId);
    if (alreadySolved) {
      return res.status(400).json({ error: 'Case already solved', correct: true });
    }

    // Calculate hint deductions for THIS case only
    const caseHintDeductions = entry.usedHints
      .filter(uh => uh.caseId.toString() === caseId)
      .reduce((sum, uh) => {
        const hint = caseItem.hints.id(uh.hintId);
        return hint ? sum + hint.pointDeduction : sum;
      }, 0);

    // Calculate final points for this case
    const earnedPoints = Math.max(0, caseItem.points - caseHintDeductions);

    // Add solved case
    entry.solvedCases.push({ caseId, solvedAt: new Date() });
    entry.score += earnedPoints;
    entry.lastUpdated = new Date();

    await entry.save();

    res.json({ 
      success: true, 
      correct: true, 
      score: entry.score, 
      earnedPoints,
      message: `Case solved! +${earnedPoints} points` 
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({ error: 'Server error submitting solution' });
  }
};

// Use a hint
const useHint = async (req, res) => {
  try {
    const detectiveId = req.user.id;
    const { caseId, hintId } = req.body;

    if (!caseId || !hintId) {
      return res.status(400).json({ error: 'Case ID and hint ID are required' });
    }

    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const hint = caseItem.hints.id(hintId);
    if (!hint) {
      return res.status(404).json({ error: 'Hint not found' });
    }

    if (!hint.released) {
      return res.status(403).json({ error: 'Hint not yet released' });
    }

    // Check if contest is still running
    const GameState = require('../models/GameState');
    const gameState = await GameState.findOne();
    if (gameState && !gameState.contestStarted) {
      return res.status(403).json({ error: 'Sorry, Contest Ended.' });
    }

    let entry = await Leaderboard.findOne({ detectiveId });
    
    if (!entry) {
      const Detective = require('../models/Detective');
      const detective = await Detective.findById(detectiveId);
      
      if (!detective) {
        return res.status(404).json({ error: 'Detective not found. Please login again.' });
      }
      
      entry = new Leaderboard({
        detectiveId,
        detectiveName: detective.username,
        score: 0
      });
    }

    // Check if hint already used
    const alreadyUsed = entry.usedHints.some(
      uh => uh.caseId.toString() === caseId && uh.hintId === hintId
    );

    if (alreadyUsed) {
      return res.json({ success: true, hint: hint.text, message: 'Hint already used' });
    }

    // Check if case is already solved (can't use hints after solving)
    const alreadySolved = entry.solvedCases.some(sc => sc.caseId.toString() === caseId);
    if (alreadySolved) {
      return res.status(400).json({ error: 'Cannot use hints for already solved cases' });
    }

    // Add used hint and deduct points immediately
    entry.usedHints.push({ caseId, hintId, usedAt: new Date() });
    entry.score = Math.max(0, entry.score - hint.pointDeduction);
    entry.lastUpdated = new Date();

    await entry.save();

    res.json({ 
      success: true, 
      hint: hint.text, 
      pointDeduction: hint.pointDeduction,
      newScore: entry.score,
      message: `Hint revealed. -${hint.pointDeduction} points` 
    });
  } catch (error) {
    console.error('Use hint error:', error);
    res.status(500).json({ error: 'Server error using hint' });
  }
};

module.exports = {
  getLeaderboard,
  getMyScore,
  submitSolution,
  useHint
};
