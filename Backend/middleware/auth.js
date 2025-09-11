const jwt = require('jsonwebtoken');
const { execute } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details from database
    const users = await execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user has required role
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware for input validation
const validateRegistration = (req, res, next) => {
  const { name, email, address, password } = req.body;

  // Name validation (20-60 characters)
  if (!name || name.length < 20 || name.length > 60) {
    return res.status(400).json({
      error: 'Name must be between 20 and 60 characters'
    });
  }

  // Address validation (max 400 characters)
  if (address && address.length > 400) {
    return res.status(400).json({
      error: 'Address must not exceed 400 characters'
    });
  }

  // Password validation (8-16 characters, uppercase, special character)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be 8-16 characters with at least one uppercase letter and one special character'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Please provide a valid email address'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  validateRegistration
};
