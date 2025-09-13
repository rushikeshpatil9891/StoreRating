const mysql = require('mysql2/promise');
require('dotenv').config();

async function testActivityLogs() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'store_rating_db'
    });

    console.log('Connected to database');

    // Check if activity_logs table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'activity_logs'");
    console.log('Activity logs table exists:', tables.length > 0);

    if (tables.length > 0) {
      // Check table structure
      const [columns] = await connection.execute("DESCRIBE activity_logs");
      console.log('Table structure:', columns.map(col => col.Field));

      // Check for recent logs
      const [logs] = await connection.execute("SELECT COUNT(*) as count FROM activity_logs");
      console.log('Total activity logs:', logs[0].count);

      // Get recent logs
      const [recentLogs] = await connection.execute(`
        SELECT al.*, u.name as user_name, u.email as user_email
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 5
      `);
      console.log('Recent logs:', recentLogs);
    }

    await connection.end();
  } catch (error) {
    console.error('Database test error:', error);
  }
}

testActivityLogs();