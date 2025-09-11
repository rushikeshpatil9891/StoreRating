const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Database connection successful');

    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Simple query successful:', rows);

    // Test user count
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log('✅ User count:', userCount[0].count);

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection();
