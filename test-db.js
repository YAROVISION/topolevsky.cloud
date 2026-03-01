const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  try {
    const db = await mysql.createConnection({
      host: '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: 3307
    });
    console.log('SUCCESS: Connected to database');
    const [rows] = await db.execute('SELECT 1');
    console.log('QueryResult:', rows);
    await db.end();
  } catch (err) {
    console.error('FAILURE:', err);
  }
}

test();
