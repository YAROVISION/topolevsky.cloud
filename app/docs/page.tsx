'use client'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { motion } from 'framer-motion'
import { Search, Shield, User, Zap, Scale } from 'lucide-react'

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
										з лексичним складом української мови та глибокого аналізу юридичних документів. Ось основні кроки, щоб
										розпочати:
									</p>
									<ul className="list-disc pl-6 space-y-2">
										<li>Створіть обліковий запис на сторінці реєстрації.</li>
										<li>
											Увійдіть у систему, використовуючи свої облікові дані.
										</li>
										<li>
											Перейдіть до розділу <strong>"Словники"</strong> для перевірки визначень слів та їхніх рівнів абстракції.
										</li>
										<li>
											Перейдіть до розділу <strong>"Логоскоп"</strong> для завантаження та інтелектуального AI-аналізу ваших процесуальних документів.
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
									<h2 className="text-2xl font-semibold">Словник та Мовний Аналіз</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>
										Використовуйте рядок пошуку для знаходження конкретних слів
										або частин мови. Наша спеціалізована база містить детальну інформацію
										про:
									</p>
									<ul className="list-disc pl-6 space-y-2 mb-6">
										<li>Граматичні категорії (відмінки, роди, числа) та частоту вживання.</li>
										<li>Морфологічні властивості слова, його синоніми (гіперніми та гіпоніми).</li>
										<li>Етимологічне походження та запозичення.</li>
									</ul>

									<h3 className="text-xl font-medium text-white mb-3">Система рівнів абстракції</h3>
									<p>
										Ключовою особливістю інструменту є <strong>класифікація слів за ступенем абстракції</strong> (за шкалою від 1 до 10).
										Ця система створена для того, щоб наочно продемонструвати базовий принцип юриспруденції: <em>логічний розбір тексту напряму залежить від ступеня конкретизації понять</em>. Чим конкретніший зміст слова (нижчий рівень абстракції), тим точніше та однозначніше виражена думка в юридичному чи будь-якому іншому документі.
									</p>
									
									<h3 className="text-xl font-medium text-white mt-6 mb-3">Алгоритм обробки:</h3>
									<ol className="list-decimal pl-6 space-y-2">
										<li><strong>Локальний пошук:</strong> При введенні слова система шукає його у власній базі, відображаючи морфологію, зв'язки та визначений рівень абстракції.</li>
										<li><strong>AI-Обробка:</strong> Якщо слово відсутнє у базі або не має визначеного рівня, підключається інтелектуальна модель, яка на льоту аналізує його, вбудовує у шкалу абстракції та автоматично зберігає для майбутніх запитів.</li>
										<li><strong>Візуалізація:</strong> Інтерфейс виводить детальну морфологічну картку та візуально розподіляє знайдені поняття за рівнями абстрактності.</li>
									</ol>
								</div>
							</section>

							{/* Section 3: Logoskop */}
							<section
								id="logoskop"
								className="scroll-mt-32"
							>
								<div className="flex items-center gap-3 mb-6">
									<Scale className="w-6 h-6 text-indigo-500" />
									<h2 className="text-2xl font-semibold">Логоскоп (AI-аналіз документів)</h2>
								</div>
								<div className="prose prose-invert max-w-none text-zinc-400">
									<p>
										<strong>Логоскоп</strong> — це інтелектуальний інструмент для глибокого аналізу процесуальних документів кримінального провадження (повідомлень про підозру, обвинувальних актів, вироків та ухвал суду).
									</p>
									<h3 className="text-xl font-medium text-white mt-6 mb-3">Базовий доступ (Безкоштовно)</h3>
									<p>
										У базовій версії Логоскоп здійснює комплексну перевірку документа за такими критеріями:
									</p>
									<ul className="list-disc pl-6 space-y-2 mb-4">
										<li><strong>Структурна перевірка:</strong> аналіз наявності всіх обов'язкових реквізитів згідно з вимогами КПК України.</li>
										<li><strong>Логічний аналіз:</strong> виявлення формальних та неформальних логічних помилок (недостатність доказів, внутрішні суперечності, підміна понять, маніпулятивні прийоми).</li>
										<li><strong>Оцінка доказів:</strong> формування переліку доказів, оцінка їх достатності та виявлення фактів, що не підкріплені доказами.</li>
										<li><strong>Перевірка кваліфікації:</strong> оцінка правильності правової кваліфікації злочину (об'єкт, об'єктивна сторона, суб'єкт, суб'єктивна сторона).</li>
										<li><strong>Базова судова практика:</strong> перевірка відповідності висновків та доказової бази усталеним правовим позиціям Верховного Суду України.</li>
									</ul>

									<h3 className="text-xl font-medium text-white mt-6 mb-3">PRO-доступ (Для платних користувачів)</h3>
									<p>
										Платна версія розширює можливості Логоскопу і перетворює його на вашого персонального стратега-консультанта. Переваги PRO-версії включають:
									</p>
									<ul className="list-disc pl-6 space-y-2">
										<li><strong>Практика ЄСПЛ:</strong> глибокий аналіз на відповідність Конвенції про захист прав людини і релевантним прецедентам Європейського суду.</li>
										<li><strong>Компаративне дослідження:</strong> детальне порівняння вашої фабули з аналогічними справами з актуальної судової практики (що спрацювало, а що ні).</li>
										<li><strong>Оцінка ризиків та вразливостей:</strong> моделювання можливих контраргументів процесуального опонента (прокурора або адвоката) та виявлення прихованих "слабких місць" документа.</li>
										<li><strong>Стратегічні рекомендації:</strong> надання конкретного покрокового плану дій, алгоритму захисту/обвинувачення та пропозицій щодо необхідних клопотань, запитів чи експертиз.</li>
									</ul>
								</div>
							</section>

							{/* Section 4: User Profile */}
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

							{/* Section 5: Security */}
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
