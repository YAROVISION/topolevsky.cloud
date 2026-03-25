'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function ActivityTracker() {
	const pathname = usePathname()

	useEffect(() => {
		const trackVisit = async () => {
			try {
				await fetch('/api/activity', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						path: pathname,
						userAgent: window.navigator.userAgent
					})
				})
			} catch (err) {
				// Silent fail
			}
		}

		trackVisit()
	}, [pathname])

	return null
}
