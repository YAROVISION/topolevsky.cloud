'use client'

import { Button } from '@/components/ui/button'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Book } from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { useSession } from 'next-auth/react'

export function FinalCTA() {
	const { data: session, status } = useSession()
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: '-100px' })
	
	const isAuthenticated = status === 'authenticated'

	return (
		<section className="py-24 px-4">
			<motion.div
				ref={ref}
				initial={{ opacity: 0, y: 40 }}
				animate={isInView ? { opacity: 1, y: 0 } : {}}
				transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
				className="max-w-4xl mx-auto text-center"
			>
				<h2
					className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight"
					style={{ fontFamily: 'var(--font-cal-sans)' }}
				>
					Готові розпочати?
				</h2>
				<div className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto space-y-4">
					<p>
						Ласкаво просимо до нашої платформи! Для початку роботи просто
						створіть безкоштовний акаунт та увійдіть у систему. Ви отримаєте
						повний доступ до всіх словників та інструментів аналізу.
					</p>
					<p>
						Наш потужний пошук допоможе миттєво знаходити граматичні форми та
						етимологію слів. Ви можете зберігати важливі знахідки у власному
						профілі, а ми гарантуємо повну безпеку ваших даних. Для отримання
						детальних інструкцій перегляньте нашу документацію.
					</p>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					{isAuthenticated ? (
						<Button
							size="lg"
							disabled
							className="bg-zinc-800 text-zinc-500 cursor-not-allowed rounded-full px-8 h-14 text-base font-medium opacity-50 transition-all duration-300"
						>
							Створити акаунт
							<ArrowRight className="ml-2 w-5 h-5" />
						</Button>
					) : (
						<Link href="/signup">
							<Button
								size="lg"
								className="shimmer-btn bg-white text-zinc-950 hover:bg-zinc-200 rounded-full px-8 h-14 text-base font-medium shadow-lg shadow-white/20 cursor-pointer"
							>
								Створити акаунт
								<ArrowRight className="ml-2 w-5 h-5" />
							</Button>
						</Link>
					)}
					<Link href="/docs">
						<Button
							variant="outline"
							size="lg"
							className="rounded-full px-8 h-14 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent cursor-pointer"
						>
							Читати документацію
							<Book className="ml-2 w-5 h-5" />
						</Button>
					</Link>
				</div>

				<p className="mt-8 text-sm text-zinc-500">
					Безкоштовно для персонального використання.
				</p>
			</motion.div>
		</section>
	)
}
