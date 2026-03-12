
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { ensureTunnel } from '../lib/db-tunnel';

dotenv.config({ path: '.env' });

async function main() {
    try {
        await ensureTunnel();
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            port: 3307,
        });
        const [rows] = await connection.execute('DESCRIBE word');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (error) {
        console.error('Error connecting to DB:', error);
    }
}

main();
