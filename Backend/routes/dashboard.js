const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard based on user role
router.get('/', authenticateToken, DashboardController.getDashboard);

// Admin specific dashboard
router.get('/admin', authenticateToken, DashboardController.getAdminDashboard);

// Store owner specific dashboard
router.get('/store-owner', authenticateToken, DashboardController.getStoreOwnerDashboard);

// Normal user specific dashboard
router.get('/user', authenticateToken, DashboardController.getUserDashboard);

module.exports = router;
