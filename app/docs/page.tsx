'use client'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { motion } from 'framer-motion'
import { Search, Shield, User, Zap } from 'lucide-react'

export default function DocsPage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black text-white">
				<Navbar />

				<div className="pt-32 pb-24 px-4">
					<div className="max-w-4xl mx-auto">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="mb-16 text-center"
						>
							<h1 className="text-4xl md:text-5xl font-bold mb-6">
								Документація
							</h1>
							<p className="text-zinc-400 text-lg">
								Повний посібник із використання нашої платформи для вивчення та
								аналізу української мови.
							</p>
						</motion.div>

						<div className="space-y-12">
							{/* Section 1: Getting Started */}
							<section
								id="getting-started"
								className="scroll-mt-32"
							>
								<div className="flex items-center gap-3 mb-6">
									<Zap className="w-6 h-6 text-emerald-500" />
									<h2 className="text-2xl font-semibold">Швидкий старт</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>
										Наш сервіс надає доступ до потужних інструментів для роботи
										з лексичним складом української мови. Ось основні кроки, щоб
										розпочати:
									</p>
									<ul className="list-disc pl-6 space-y-2">
										<li>Створіть обліковий запис на сторінці реєстрації.</li>
										<li>
											Увійдіть у систему, використовуючи свої облікові дані.
										</li>
										<li>
											Перейдіть до розділу "Словники" для початку пошуку слів.
										</li>
									</ul>
								</div>
							</section>

							{/* Section 2: Search and Analysis */}
							<section
								id="search"
								className="scroll-mt-32"
							>
								<div className="flex items-center gap-3 mb-6">
									<Search className="w-6 h-6 text-blue-500" />
									<h2 className="text-2xl font-semibold">Пошук та аналіз</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>
										Використовуйте рядок пошуку для знаходження конкретних слів
										або частин мови. Наша база даних містить детальну інформацію
										про:
									</p>
									<ul className="list-disc pl-6 space-y-2">
										<li>Граматичні категорії (відмінки, роди, числа).</li>
										<li>Частоту вживання слів у літературній мові.</li>
										<li>Етимологічне походження та запозичення.</li>
									</ul>
								</div>
							</section>

							{/* Section 3: User Profile */}
							<section
								id="profile"
								className="scroll-mt-32"
							>
								<div className="flex items-center gap-3 mb-6">
									<User className="w-6 h-6 text-purple-500" />
									<h2 className="text-2xl font-semibold">Особистий профіль</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>У вашому профілі ви можете:</p>
									<ul className="list-disc pl-6 space-y-2">
										<li>Налаштовувати свої персональні дані.</li>
										<li>Завантажувати аватар для персоналізації акаунту.</li>
										<li>
											Переглядати історію своїх запитів та збережені слова.
										</li>
									</ul>
								</div>
							</section>

							{/* Section 4: Security */}
							<section
								id="security"
								className="scroll-mt-32"
							>
								<div className="flex items-center gap-3 mb-6">
									<Shield className="w-6 h-6 text-red-500" />
									<h2 className="text-2xl font-semibold">
										Безпека та конфіденційність
									</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>
										Ми дбаємо про ваші дані. Всі паролі шифруються, а
										завантажені файли зберігаються у захищеному сховищі. Ми не
										передаємо ваші особисті дані третім особам.
									</p>
								</div>
							</section>
						</div>
					</div>
				</div>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
