const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken, validateRegistration } = require('../middleware/auth');

// User registration
router.post('/register', validateRegistration, AuthController.register);

// User login
router.post('/login', AuthController.login);

// Get current user profile (protected route)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Update user profile (protected route)
router.put('/profile', authenticateToken, AuthController.updateProfile);

module.exports = router;
