const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database');

    // Check if tables exist
    const [tables] = await connection.execute("SHOW TABLES");
    console.log('📋 Tables in database:', tables.map(t => Object.values(t)[0]));

    // Check ratings table structure
    try {
      const [ratingsStructure] = await connection.execute("DESCRIBE ratings");
      console.log('📊 Ratings table structure:');
      ratingsStructure.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    } catch (error) {
      console.log('❌ Ratings table does not exist or has issues:', error.message);
    }

    // Check if there are any ratings
    try {
      const [ratingCount] = await connection.execute("SELECT COUNT(*) as count FROM ratings");
      console.log('⭐ Total ratings in database:', ratingCount[0].count);
    } catch (error) {
      console.log('❌ Cannot query ratings table:', error.message);
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTables();
