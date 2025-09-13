const { execute } = require('../config/database');

class ActivityLog {
  // Create a new activity log entry
  static async create(activityData) {
    const { user_id, action, description, ip_address, user_agent } = activityData;

    const query = `
      INSERT INTO activity_logs (user_id, action, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await execute(query, [user_id, action, description, ip_address, user_agent]);
    return result.insertId;
  }

  // Get activity logs with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT al.*,
             u.name as user_name,
             u.email as user_email,
             u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND al.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.action) {
      query += ' AND al.action = ?';
      params.push(filters.action);
    }

    if (filters.start_date) {
      query += ' AND al.created_at >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      query += ' AND al.created_at <= ?';
      params.push(filters.end_date);
    }

    // Sorting - validate column names to prevent SQL injection
    const allowedSortColumns = ['id', 'user_id', 'action', 'description', 'created_at'];
    const sortBy = allowedSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY al.\`${sortBy}\` ${sortOrder}`;

    // Pagination - add bounds checking
    if (filters.limit && typeof filters.limit === 'number' && filters.limit > 0) {
      const safeLimit = Math.min(Math.max(filters.limit, 1), 1000);
      if (filters.offset && typeof filters.offset === 'number' && filters.offset >= 0) {
        const safeOffset = Math.max(filters.offset, 0);
        query += ` LIMIT ${safeLimit} OFFSET ${safeOffset}`;
      } else {
        query += ` LIMIT ${safeLimit}`;
      }
    }

    const logs = await execute(query, params);
    return logs;
  }

  // Get activity statistics
  static async getStats() {
    const query = `
      SELECT
        COUNT(*) as total_activities,
        COUNT(DISTINCT user_id) as active_users,
        action,
        COUNT(*) as action_count
      FROM activity_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY action
      ORDER BY action_count DESC
    `;
    const result = await execute(query);
    return result;
  }

  // Get recent activities (last 50)
  static async getRecentActivities(limit = 50) {
    // Ensure limit is a valid number and within reasonable bounds
    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 1000);

    const query = `
      SELECT al.*,
             u.name as user_name,
             u.email as user_email,
             u.role as user_role
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${safeLimit}
    `;
    const logs = await execute(query);
    return logs;
  }
}

module.exports = ActivityLog;