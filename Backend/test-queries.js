const mysql = require('mysql2/promise');
require('dotenv').config();

async function testQueries() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Test 1: Simple ratings query
    try {
      const [ratings] = await connection.execute("SELECT * FROM ratings LIMIT 5");
      console.log('✅ Simple ratings query works:', ratings.length, 'records');
    } catch (error) {
      console.log('❌ Simple ratings query failed:', error.message);
    }

    // Test 2: JOIN query for store ratings
    try {
      const [storeRatings] = await connection.execute(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = 1
        ORDER BY r.created_at DESC
        LIMIT 10
      `);
      console.log('✅ Store ratings JOIN query works:', storeRatings.length, 'records');
    } catch (error) {
      console.log('❌ Store ratings JOIN query failed:', error.message);
    }

    // Test 3: JOIN query for user ratings
    try {
      const [userRatings] = await connection.execute(`
        SELECT r.*, s.name as store_name, s.email as store_email
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        WHERE r.user_id = 1
        ORDER BY r.created_at DESC
        LIMIT 10
      `);
      console.log('✅ User ratings JOIN query works:', userRatings.length, 'records');
    } catch (error) {
      console.log('❌ User ratings JOIN query failed:', error.message);
    }

    // Test 4: Check foreign key data
    try {
      const [users] = await connection.execute("SELECT id, name FROM users LIMIT 3");
      const [stores] = await connection.execute("SELECT id, name FROM stores LIMIT 3");
      console.log('👥 Users:', users);
      console.log('🏪 Stores:', stores);
    } catch (error) {
      console.log('❌ Foreign key data check failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testQueries();
