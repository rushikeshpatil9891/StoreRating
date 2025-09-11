const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, authorizeRoles, validateRegistration } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), UserController.getAllUsers);

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), UserController.getUserStats);

// Get user by ID
router.get('/:id', authenticateToken, UserController.getUserById);

// Create new user (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), UserController.createUser);

// Update user
router.put('/:id', authenticateToken, UserController.updateUser);

// Delete user (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), UserController.deleteUser);

module.exports = router;
