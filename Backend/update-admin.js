const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdminPassword() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database');

    // Update admin password with correct hash
    const correctHash = '$2b$10$xNV.KdlJXiMbIrV0cvqOneeT5SPVJefUwDmPzXU5N4kQX0.ST6Tcq';

    await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [correctHash, 'admin@storerating.com']
    );

    console.log('Admin password updated successfully');

    // Verify the update
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@storerating.com']
    );

    console.log('Updated admin user:', rows[0]);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateAdminPassword();
