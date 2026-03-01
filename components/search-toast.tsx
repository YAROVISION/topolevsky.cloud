'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function SearchToast({ word }: { word?: string }) {
	useEffect(() => {
		if (word) {
			toast.error(`Слово "${word}" не знайдено або не класифіковано`, {
				position: 'top-center',
				duration: 3000
			})
		}
	}, [word])

	return null
}
