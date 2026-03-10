'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { Logo } from './logo'

const footerLinks = {
	Сервіс: [
		{ label: 'Словник', href: '/features' },
		{ label: 'Логоскоп', href: '/logoskop' }
	],
	Ресурси: [
		{ label: 'Документація', href: '/docs' },
		{ label: 'Блог', href: '/blog' }
	],
	Компанія: [
		{ label: 'Контакти', href: '/contact' },
		{ label: 'Безпека', href: '/security' }
	],
	// For 'Права' we provide explicit hrefs so 'Конфіденційність' points to a real page
	Права: [
		{ label: 'Конфіденційність', href: '/privacy' },
		{ label: 'Ліцензія', href: '/license' }
	]
}

export function Footer() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: '-50px' })
	const [showLicense, setShowLicense] = useState(false)

	// license text inlined from LICENSE file for quick display
	const licenseText = `© 2026 Lexis, Inc. Всі права захищено.

Увесь вміст цього сайту, включно з, але не обмежуючись:
текстами, зображеннями, графікою, дизайном, програмним кодом,
базами даних, алгоритмами та структурою сайту — є власністю
Lexis, Inc. і захищений законодавством України про авторське
право та міжнародними угодами про інтелектуальну власність.

Забороняється без письмового дозволу Lexis, Inc.:
— копіювати, відтворювати або розповсюджувати будь-які матеріали;
— використовувати матеріали в комерційних цілях;
— змінювати, адаптувати або створювати похідні роботи;
— здійснювати реверс-інжиніринг програмного забезпечення;
— копіювати або використовувати структуру бази даних;
— автоматично збирати дані з сайту (парсинг, скрейпінг).

Порушення цих умов може призвести до цивільної або
кримінальної відповідальності відповідно до чинного
законодавства України.`

	return (
		<footer
			ref={ref}
			className="border-t border-zinc-800 bg-zinc-950"
		>
			<div className="max-w-6xl mx-auto px-4 py-16">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="grid grid-cols-2 md:grid-cols-5 gap-8"
				>
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Logo />
						<p className="text-sm text-zinc-500 mb-4">
							Платформа перевірки логічної узгодженості тексту.
						</p>
						{/* System Status */}
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
							<span className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow" />
							<span className="text-xs text-zinc-400">
								Всі системи працюють
							</span>
						</div>
					</div>
					{/* Links */}
					{Object.entries(footerLinks).map(([title, links]) => (
						<div key={title}>
							<h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
							<ul className="space-y-3">
								{links.map(link => {
									const label = typeof link === 'string' ? link : link.label
									const href = typeof link === 'string' ? '#' : link.href
									// if this is the license link, toggle inline display instead of navigating
									const isLicense =
										href === '/privacy' ? false : href === '/license'
									return (
										<li key={label}>
											{isLicense ? (
												<button
													onClick={() => setShowLicense(true)}
													className="text-sm text-zinc-500 hover:text-white transition-colors"
												>
													{label}
												</button>
											) : (
												<a
													href={href}
													className="text-sm text-zinc-500 hover:text-white transition-colors"
												>
													{label}
												</a>
											)}
										</li>
									)
								})}
							</ul>
						</div>
					))}

					{/* Inline license modal */}
					{showLicense && (
						<div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
							<div
								className="absolute inset-0 bg-black/60"
								onClick={() => setShowLicense(false)}
							/>
							<div className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-zinc-300 z-10">
								<div className="flex justify-between items-start gap-4">
									<h3 className="text-lg font-semibold text-white">Ліцензія</h3>
									<button
										onClick={() => setShowLicense(false)}
										className="text-sm text-zinc-400 hover:text-white"
									>
										Закрити
									</button>
								</div>
								<pre className="whitespace-pre-wrap mt-4 text-sm text-zinc-300 max-h-80 overflow-auto">
									{licenseText}
								</pre>
							</div>
						</div>
					)}
				</motion.div>

				{/* Bottom */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={isInView ? { opacity: 1 } : {}}
					transition={{ duration: 0.6, delay: 0.3 }}
					className="mt-16 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4"
				>
					<p className="text-sm text-zinc-500">
						&copy; {new Date().getFullYear()} Lexis, Inc. All rights reserved.
					</p>
					<div className="flex items-center gap-6">
						<a
							href="#"
							className="text-sm text-zinc-500 hover:text-white transition-colors"
						>
							X
						</a>
						<a
							href="https://www.instagram.com/lexisukraine/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-zinc-500 hover:text-white transition-colors"
						>
							Instagram
						</a>
						<a
							href="#"
							className="text-sm text-zinc-500 hover:text-white transition-colors"
						>
							TikTok
						</a>
					</div>
				</motion.div>
			</div>
		</footer>
	)
}
