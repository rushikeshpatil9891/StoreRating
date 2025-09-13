const ActivityLog = require('../models/ActivityLog');

class ActivityLogController {
  // Get all activity logs (Admin only)
  static async getAllLogs(req, res) {
    try {
      const {
        user_id,
        action,
        start_date,
        end_date,
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit = 50,
        offset = 0
      } = req.query;

      const filters = {
        user_id,
        action,
        start_date,
        end_date,
        sortBy,
        sortOrder
      };

      // Only add limit/offset if they are valid numbers
      if (limit && !isNaN(parseInt(limit))) {
        filters.limit = parseInt(limit);
      }

      if (offset && !isNaN(parseInt(offset))) {
        filters.offset = parseInt(offset);
      }

      const logs = await ActivityLog.findAll(filters);

      res.json({
        logs,
        pagination: {
          limit: filters.limit || null,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      console.error('Get activity logs error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get activity statistics (Admin only)
  static async getActivityStats(req, res) {
    try {
      const stats = await ActivityLog.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Get activity stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get recent activities (Admin only)
  static async getRecentActivities(req, res) {
    try {
      console.log('getRecentActivities called by user:', req.user?.id, req.user?.role);
      const { limit = 50 } = req.query;
      const activities = await ActivityLog.getRecentActivities(parseInt(limit));
      console.log(`Returning ${activities.length} activities`);
      res.json({ activities });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Log an activity (internal method)
  static async logActivity(userId, action, description, req = null) {
    try {
      console.log(`Logging activity: ${action} for user ${userId}`);
      const activityData = {
        user_id: userId,
        action,
        description,
        ip_address: req ? req.ip : null,
        user_agent: req ? req.get('User-Agent') : null
      };

      const result = await ActivityLog.create(activityData);
      console.log(`Activity logged successfully:`, result);
    } catch (error) {
      console.error('Error logging activity:', error);
      console.error('Activity data:', { userId, action, description });
      // Don't throw error to avoid breaking the main functionality
    }
  }
}

module.exports = ActivityLogController;