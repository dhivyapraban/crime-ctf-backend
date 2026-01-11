const express = require('express');
const cors = require('cors');
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
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

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
