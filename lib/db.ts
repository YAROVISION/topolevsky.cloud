import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || (process.env.NODE_ENV === 'production' ? 3306 : 3307)),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
