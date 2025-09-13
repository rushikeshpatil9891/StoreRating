const express = require('express');
const router = express.Router();
const ActivityLogController = require('../controllers/activityLogController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all activity logs (Admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), ActivityLogController.getAllLogs);

// Get activity statistics (Admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), ActivityLogController.getActivityStats);

// Get recent activities (Admin only)
router.get('/recent', authenticateToken, authorizeRoles('admin'), ActivityLogController.getRecentActivities);

module.exports = router;