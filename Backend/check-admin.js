const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkAndCreateAdmin() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Check if admin user exists
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@storerating.com']
    );

    if (rows.length > 0) {
      console.log('Admin user already exists:', rows[0]);
    } else {
      console.log('Admin user not found, creating...');

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      // Insert admin user
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['System Administrator', 'admin@storerating.com', hashedPassword, 'admin']
      );

      console.log('Admin user created with ID:', result.insertId);
    }

    // Test password verification
    const adminUser = rows.length > 0 ? rows[0] : null;
    if (adminUser) {
      const isValid = await bcrypt.compare('admin123', adminUser.password);
      console.log('Password verification test:', isValid ? 'PASS' : 'FAIL');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAndCreateAdmin();
