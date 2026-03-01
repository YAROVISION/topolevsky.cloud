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
				<SidebarGroupContent className="relative">
					<Label
						htmlFor="search"
						className="sr-only"
					>
						Search
					</Label>
					<SidebarInput
						id="search"
						name="search"
						defaultValue={searchParams.get('search') ?? ''}
						placeholder="Search the docs..."
						className="pl-8"
					/>
					<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
				</SidebarGroupContent>
			</SidebarGroup>
		</form>
	)
}
