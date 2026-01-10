const express = require('express');
const connectDB = require('./config/database');
const detectiveRoutes = require('./routes/detectiveRoutes');
const chiefRoutes = require('./routes/chiefRoutes');
const caseRoutes = require('./routes/caseRoutes');
const gameRoutes = require('./routes/gameRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/detective', detectiveRoutes);
app.use('/api/chief', chiefRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'CTF Backend API - Running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
