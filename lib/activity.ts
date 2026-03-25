import { userQuery } from './users-db'

export async function logActivity({
	userId,
	email,
	path,
	method,
	ip,
	userAgent
}: {
	userId?: number | string | null
	email?: string | null
	path: string
	method: string
	ip?: string | null
	userAgent?: string | null
}) {
	try {
        // userId might come as a string from JWT, convert to number if possible
        const numericUserId = userId ? Number(userId) : null;
        
		await userQuery(
			`INSERT INTO user_activity (userId, email, path, method, ip, userAgent) 
             VALUES (?, ?, ?, ?, ?, ?)`,
			[
				numericUserId || null,
				email || null,
				path,
				method,
				ip || null,
				userAgent || null
			]
		)
	} catch (error) {
		console.error('[ActivityLog] Error:', error)
	}
}
