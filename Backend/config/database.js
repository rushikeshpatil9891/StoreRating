const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration that works for both local and cloud databases
// For local databases: Set DB_SSL=false (or omit it)
// For cloud databases (like Aiven): Set DB_SSL=true and provide DB_SSL_CA path

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === "true"
    ? {
        ca: fs.readFileSync(__dirname + '/../' + process.env.DB_SSL_CA, 'utf8'),
        rejectUnauthorized: true
      }
    : false
};

let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('Database connection pool created successfully');
  }
  return pool;
};

module.exports = {
  getPool,
  execute: async (query, params = []) => {
    const pool = getPool();
    const [rows] = await pool.execute(query, params);
    return rows;
  }
};                                                                                                                            
