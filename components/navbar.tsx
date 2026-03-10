'use client'

import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

import {
	Avatar,
	AvatarBadge,
	AvatarFallback,
	AvatarImage
} from '@/components/ui/avatar'

const navItems = [
	{ label: 'Словники', href: '/features' },
	{ label: 'Логоскоп', href: '/logoskop' },
	{ label: 'Документація', href: '/docs' },
	{ label: 'Блог', href: '/blog' }
]

export function Navbar() {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const navRef = useRef<HTMLDivElement>(null)
	const session = useSession()
	const pathname = usePathname()

	console.log('User session:', session)

	return (
		<motion.header
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
			className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
		>
			<nav
				ref={navRef}
				className="relative flex items-center justify-between px-4 py-3 rounded-full bg-zinc-900/40 backdrop-blur-md border border-zinc-800"
			>
				{/* Logo */}
				<Logo />
				{/* Desktop Nav Items */}
				<div className="hidden md:flex items-center gap-1 relative">
					{navItems.map((item, index) => {
						const isActive = pathname === item.href
						const isHovered = hoveredIndex === index
						const showBackground =
							isHovered || (isActive && hoveredIndex === null)

						return (
							<Link
								key={item.label}
								href={item.href}
								className={`relative px-4 py-2 text-sm transition-colors ${
									isActive
										? 'text-white font-medium'
										: 'text-zinc-400 hover:text-white'
								}`}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
							>
								{showBackground && (
									<motion.div
										layoutId="navbar-hover"
										className={`absolute inset-0 rounded-full ${
											isActive && !isHovered ? 'bg-zinc-800/60' : 'bg-zinc-800'
										}`}
										initial={false}
										transition={{ type: 'spring', stiffness: 500, damping: 30 }}
									/>
								)}
								<span className="relative z-10">{item.label}</span>
							</Link>
						)
					})}
				</div>
				{/* CTA Buttons */}
				<div className="hidden md:flex items-center gap-3">
					{session.status === 'authenticated' ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="avatar">
									<Avatar>
										<AvatarImage
											src={
												session.data?.user?.image ||
												'https://github.com/shadcn.png'
											}
											alt={session.data?.user?.name || '@shadcn'}
										/>

										<AvatarFallback>
											{session.data?.user?.name
												?.substring(0, 2)
												.toUpperCase() || 'CN'}
										</AvatarFallback>
										<AvatarBadge className="bg-green-600 dark:bg-green-800" />
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuGroup>
									<DropdownMenuLabel className="text-emerald-400">
										{session.data?.user?.name}
									</DropdownMenuLabel>
									<DropdownMenuItem asChild>
										<Link href="/profile">Профайл</Link>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
									Вихід
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<a href="/api/auth/signin">
							<Button
								variant="ghost"
								size="sm"
								className="text-zinc-400 hover:text-white hover:bg-zinc-800"
							>
								Вхід
							</Button>
						</a>
					)}

					{/* 'Розпочати' button removed as requested */}
				</div>
				{/* Mobile Menu Button */}
				<button
					className="md:hidden p-2 text-zinc-400 hover:text-white"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</nav>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-zinc-800"
				>
					<div className="flex flex-col gap-2">
						{navItems.map(item => (
							<a
								key={item.label}
								href={item.href}
								className="px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
								onClick={() => setMobileMenuOpen(false)}
							>
								{item.label}
							</a>
						))}
						<hr className="border-zinc-800 my-2" />
						<a href="/login">
							<Button
								variant="ghost"
								className="justify-start text-zinc-400 hover:text-white"
							>
								Вхід
							</Button>
						</a>
						{/* 'Розпочати' button removed from mobile menu as requested */}
					</div>
				</motion.div>
			)}
		</motion.header>
	)
}
