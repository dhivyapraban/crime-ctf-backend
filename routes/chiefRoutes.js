const express = require('express');
const router = express.Router();
const chiefController = require('../controllers/chiefController');
const { authenticateToken } = require('../middleware/auth');

// Chief Login
router.post('/login', chiefController.login);

// Chief Logout (Protected)
router.post('/logout', authenticateToken, chiefController.logout);

// Get Chief Profile (Protected)
router.get('/profile', authenticateToken, chiefController.getProfile);

module.exports = router;
