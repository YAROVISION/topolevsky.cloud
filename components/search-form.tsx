'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import { Label } from '@/components/ui/label'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput
} from '@/components/ui/sidebar'

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
	const router = useRouter()
	const searchParams = useSearchParams()

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const search = formData.get('search') as string
		const params = new URLSearchParams(searchParams.toString())

		if (search) {
			params.set('search', search)
		} else {
			params.delete('search')
		}

		router.push(`?${params.toString()}`)
	}

	return (
		<form
			{...props}
			onSubmit={handleSubmit}
		>
			<SidebarGroup className="py-0">
				<SidebarGroupContent className="relative flex items-center gap-1">
					<Label
						htmlFor="search"
						className="sr-only"
					>
						Пошук
					</Label>
					<div className="relative flex-1">
						<SidebarInput
							id="search"
							name="search"
							defaultValue={searchParams.get('search') ?? ''}
							placeholder="Пошук слова..."
							className="pl-8 pr-2"
						/>
						<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
					</div>
					<button
						type="submit"
						className="flex items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors size-8 shrink-0"
						aria-label="Шукати"
					>
						<Search className="size-4" />
					</button>
				</SidebarGroupContent>
			</SidebarGroup>
		</form>
	)
}
