import 'dotenv/config'
import { userQuery } from './lib/users-db'

async function testConnection() {
	try {
		console.log('Testing DB connection...')
		const rows = await userQuery('SELECT 1 as val')
		console.log('Success! Result:', rows)
	} catch (err) {
		console.error('Connection Failed:', err)
	} finally {
		process.exit(0)
	}
}

testConnection()
