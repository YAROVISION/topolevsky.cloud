import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
	const secret = request.nextUrl.searchParams.get('secret')
	const path = request.nextUrl.searchParams.get('path') || '/blog'

	// Перевірка секретного токена
	if (secret !== process.env.REVALIDATE_SECRET) {
		return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
	}

	try {
		// Очищення кешу для вказаного шляху
		revalidatePath(path)
		// Також очищуємо головну сторінку, якщо оновлюємо конкретну статтю
		if (path.startsWith('/blog/')) {
			revalidatePath('/blog')
		}

		console.log(`[Revalidation] Cache cleared for: ${path}`)
		return NextResponse.json({ revalidated: true, now: Date.now() })
	} catch (err) {
		return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
	}
}
