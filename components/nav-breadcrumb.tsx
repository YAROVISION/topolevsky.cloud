'use client'

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { useSidebar } from '@/components/ui/sidebar'

export function NavBreadcrumb({
	parent,
	title
}: {
	parent: string
	title: string
}) {
	const { open, isMobile } = useSidebar()

	// Показуємо тільки якщо сайдбар відкритий (на десктопі)
	// На мобілці SidebarProvider керує openMobile, але тут ми зазвичай орієнтуємось на десктопний стан
	if (!open && !isMobile) return null

	return (
		<>
			<Separator
				orientation="vertical"
				className="mr-2 h-4 hidden md:block"
			/>
			<Breadcrumb className="hidden md:block">
				<BreadcrumbList>
					<BreadcrumbItem className="hidden md:block">
						<BreadcrumbLink href="#">{parent}</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator className="hidden md:block" />
					<BreadcrumbItem>
						<BreadcrumbPage>{title}</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		</>
	)
}
