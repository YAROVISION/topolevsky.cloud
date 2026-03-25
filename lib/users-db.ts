import mysql from 'mysql2/promise'

const pool = mysql.createPool({
	host:     process.env.USERS_DB_HOST     ?? '127.0.0.1',
	user:     process.env.USERS_DB_USER     ?? '',
	password: process.env.USERS_DB_PASS     ?? '',
	database: process.env.USERS_DB_NAME     ?? '',
	port:     Number(process.env.USERS_DB_PORT ?? 3306),
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
})

console.log(`[DB] Initialize Auth connection to:`, {
	host: process.env.USERS_DB_HOST ?? '127.0.0.1',
	port: Number(process.env.USERS_DB_PORT ?? 3306)
});

export async function userQuery<T = any>(sql: string, values?: any[]): Promise<T[]> {
	const [rows] = await pool.execute(sql, values)
	return rows as T[]
}
