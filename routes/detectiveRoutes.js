const express = require('express');
const router = express.Router();
const detectiveController = require('../controllers/detectiveController');
const { authenticateToken } = require('../middleware/auth');

// Detective Login
router.post('/login', detectiveController.login);

// Detective Logout (Protected)
router.post('/logout', authenticateToken, detectiveController.logout);

// Get Detective Profile (Protected)
router.get('/profile', authenticateToken, detectiveController.getProfile);

module.exports = router;
