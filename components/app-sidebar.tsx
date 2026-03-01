import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

import { SearchForm } from '@/components/search-form'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger
} from '@/components/ui/collapsible'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail
} from '@/components/ui/sidebar'
import { VersionSwitcher } from '@/components/version-switcher'

// This is sample data.
export const data = {
	versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
	navMain: [
		{
			title: 'Категорії',
			url: '#',
			items: [
				{
					title: 'Категорія 1',
					url: '#'
				},
				{
					title: 'Категорія 2',
					url: '#'
				},
				{
					title: 'Категорія 3',
					url: '#'
				},
				{
					title: 'Категорія 4',
					url: '#'
				},
				{
					title: 'Категорія 5',
					url: '#'
				},
				{
					title: 'Категорія 6',
					url: '#'
				},
				{
					title: 'Категорія 7',
					url: '#'
				},
				{
					title: 'Категорія 8',
					url: '#'
				},
				{
					title: 'Категорія 9',
					url: '#'
				},
				{
					title: 'Категорія 10',
					url: '#'
				}
			]
		},
		{
			title: 'Частини мови',
			url: '#',
			items: [
				{
					title: 'Іменник',
					url: '#'
				},
				{
					title: 'Прикметник',
					url: '#',
					isActive: true
				},
				{
					title: 'Дієслово',
					url: '#'
				},
				{
					title: 'Прийменник',
					url: '#'
				},
				{
					title: 'Займенник',
					url: '#'
				},
				{
					title: 'Числівник',
					url: '#'
				},
				{
					title: 'Прислівник',
					url: '#'
				},
				{
					title: 'Позначення',
					url: '#'
				},
				{
					title: 'Сполучник',
					url: '#'
				},
				{
					title: 'Частка',
					url: '#'
				},
				{
					title: 'Вигук',
					url: '#'
				}
			]
		},
		{
			title: 'API Reference',
			url: '#',
			items: [
				{
					title: 'Components',
					url: '#'
				},
				{
					title: 'File Conventions',
					url: '#'
				},
				{
					title: 'Functions',
					url: '#'
				},
				{
					title: 'next.config.js Options',
					url: '#'
				},
				{
					title: 'CLI',
					url: '#'
				},
				{
					title: 'Edge Runtime',
					url: '#'
				}
			]
		},
		{
			title: 'Architecture',
			url: '#',
			items: [
				{
					title: 'Accessibility',
					url: '#'
				},
				{
					title: 'Fast Refresh',
					url: '#'
				},
				{
					title: 'Next.js Compiler',
					url: '#'
				},
				{
					title: 'Supported Browsers',
					url: '#'
				},
				{
					title: 'Turbopack',
					url: '#'
				}
			]
		},
		{
			title: 'Community',
			url: '#',
			items: [
				{
					title: 'Contribution Guide',
					url: '#'
				}
			]
		}
	]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props} >
			<SidebarHeader>
				{/* Logo */}
				<a
					href="/"
					className="flex items-center gap-2"
				>
					<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center ml-2">
						<span className="text-zinc-950 font-bold text-sm">L</span>
					</div>
					<span className="font-semibold text-white hidden sm:block">Lexis</span>
				</a>
				<VersionSwitcher
					versions={data.versions}
					defaultVersion={data.versions[0]}
				/>
				<SearchForm />
			</SidebarHeader>
			<SidebarContent className="gap-0">
				{/* We create a collapsible SidebarGroup for each parent. */}
				{data.navMain.map(group => (
					<Collapsible
						key={group.title}
						title={group.title}
						defaultOpen
						className="group/collapsible"
					>
						<SidebarGroup>
							<SidebarGroupLabel
								asChild
								className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sm"
							>
								<CollapsibleTrigger>
									{group.title}{' '}
									<ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
								</CollapsibleTrigger>
							</SidebarGroupLabel>
							<CollapsibleContent>
								<SidebarGroupContent>
									<SidebarMenu>
										{group.items.map(item => (
											<SidebarMenuItem key={item.title}>
												<SidebarMenuButton
													asChild
													isActive={item.isActive}
												>
													<Link href={`?parent=${encodeURIComponent(group.title)}&title=${encodeURIComponent(item.title)}`}>{item.title}</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										))}
									</SidebarMenu>
								</SidebarGroupContent>
							</CollapsibleContent>
						</SidebarGroup>
					</Collapsible>
				))}
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	)
}
