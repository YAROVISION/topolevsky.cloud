import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function setupActivityLog() {
  const connection = await mysql.createConnection({
    host: process.env.USERS_DB_HOST || '127.0.0.1',
    user: process.env.USERS_DB_USER,
    password: process.env.USERS_DB_PASS,
    database: process.env.USERS_DB_NAME,
    port: Number(process.env.USERS_DB_PORT || 3306),
  });

  try {
    console.log('--- Database Setup ---');
    console.log('Host:', process.env.USERS_DB_HOST || '127.0.0.1');
    console.log('Database:', process.env.USERS_DB_NAME);
    
    const sqlPath = path.join(process.cwd(), 'scripts', 'create-activity-table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await connection.execute(sql);
    console.log('✅ Table `user_activity` created successfully!');
  } catch (err) {
    console.error('❌ Error creating table:', err.message);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

setupActivityLog();
