const mysql = require('mysql2/promise');
const fs = require('fs');

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
        ca: fs.readFileSync(process.env.DB_SSL_CA, 'utf8'), // read from file path
        rejectUnauthorized: true
      }
    : false
};

let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
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
