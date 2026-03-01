import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 3307, // Using the local port from the SSH tunnel
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
