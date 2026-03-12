import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

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
import { Logo } from './logo'

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
		}
	]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar {...props}>
			<SidebarHeader>
				{/* Logo */}
				<Logo />
				<VersionSwitcher
					versions={data.versions}
					defaultVersion={data.versions[0]}
				/>
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
													<Link
														href={`?parent=${encodeURIComponent(group.title)}&title=${encodeURIComponent(item.title)}`}
													>
														{item.title}
													</Link>
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
