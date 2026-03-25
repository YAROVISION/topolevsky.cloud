import { logActivity } from '@/lib/activity'
import { authConfig } from '@/config/auth'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authConfig)
		const body = await req.json()
		const { path, userAgent } = body

		if (!path) {
			return NextResponse.json({ error: 'Path is required' }, { status: 400 })
		}

		const ip = req.headers.get('x-forwarded-for') || (req as any).ip

		// Only log visits, skip logging the logger itself to avoid infinite loops
        if (path.includes('/api/activity')) return NextResponse.json({ ok: true })

		await logActivity({
			userId: session?.user?.id,
			email: session?.user?.email,
			path,
			method: 'VISIT',
			ip,
			userAgent: userAgent || req.headers.get('user-agent')
		})

		return NextResponse.json({ ok: true })
	} catch (error) {
		console.error('[ActivityAPI] Error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
