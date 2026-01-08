const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Chief = require('../models/Chief');
const { JWT_SECRET } = require('../middleware/auth');

// Chief Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const chief = await Chief.findOne({ username });
    if (!chief) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, chief.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { 
        id: chief._id, 
        username: chief.username,
        role: 'chief'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      role: 'chief',
      user: {
        username: chief.username
      }
    });
  } catch (error) {
    console.error('Chief login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Get Chief Profile
const getProfile = async (req, res) => {
  try {
    const chief = await Chief.findById(req.user.id).select('-password');
    if (!chief) {
      return res.status(404).json({ error: 'Chief not found' });
    }
    res.json({ success: true, user: chief });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout Chief
const logout = async (req, res) => {
  try {
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
