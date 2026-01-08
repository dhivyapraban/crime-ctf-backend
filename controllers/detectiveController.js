const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Detective = require('../models/Detective');
const { JWT_SECRET } = require('../middleware/auth');

// Detective Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const detective = await Detective.findOne({ username });
    if (!detective) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, detective.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { 
        id: detective._id, 
        username: detective.username,
        role: 'detective'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      role: 'detective',
      user: {
        username: detective.username
      }
    });
  } catch (error) {
    console.error('Detective login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get Detective Profile
const getProfile = async (req, res) => {
  try {
    const detective = await Detective.findById(req.user.id).select('-password');
    if (!detective) {
      return res.status(404).json({ error: 'Detective not found' });
    }
    res.json({ success: true, user: detective });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout Detective
const logout = async (req, res) => {
  try {
    // Since JWT is stateless, logout is handled client-side by removing the token
    // This endpoint can be used for logging purposes or future token blacklisting
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
};

module.exports = {
  login,
  getProfile,
  logout
};
