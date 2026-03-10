'use client'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Search } from 'lucide-react'
import { useState } from 'react'

// Mock data for blog posts
const ALL_POSTS = [
	{
		id: 1,
		category: 'Навчання',
		title: 'Libruk: Українська електронна бібліотека класики та сучасності',
		excerpt:
			'Величезна колекція творів українських письменників, доступна для читання онлайн та завантаження. Від класики Тараса Шевченка до сучасного самвидаву.',
		date: '10 Березня, 2026',
		readTime: '5 хв',
		image:
			'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop',
		externalUrl: 'https://libruk.com.ua/'
	},
	{
		id: 2,
		category: 'Навчання',
		title: 'Логіка: вступ та історія',
		excerpt:
			'Короткий огляд логіки — її історія, основні парадигми та практичні застосування у філософії і науці (джерело: Вікіпедія).',
		date: '10 Березня, 2026',
		readTime: '6 хв',
		image:
			'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://uk.wikipedia.org/wiki/%D0%9B%D0%BE%D0%B3%D1%96%D0%BA%D0%B0'
	},
	{
		id: 3,
		category: 'Навчання',
		title: '10 книг для збагачення словникового запасу',
		excerpt:
			'Підбірка книг, написаних бездоганною українською мовою — чудовий ресурс для тих, хто хоче розширити свій лексикон та покращити стиль мови (джерело: Vseosvita).',
		date: '10 Березня, 2026',
		readTime: '5 хв',
		image:
			'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://vseosvita.ua/blogs/10-knyh-napysani-bezdohannoiu-ukrainskoiu-movoiu-dlia-zbahachennia-slovnykovoho-zapasu-81656.html'
	},
	{
		id: 4,
		category: 'Лінгвістика',
		title: 'Словотвір: шукаємо відповідники запозиченим словам',
		excerpt:
			'Як перекласти "дедлайн" українською? Реченець, крайчас чи часоскін? Знайомство з проєктом Словотвір та його найкращими знахідками.',
		date: '10 Березня, 2026',
		readTime: '6 хв',
		image:
			'https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?q=80&w=800&auto=format&fit=crop',
		externalUrl: 'https://slovotvir.org.ua/words/dedlain'
	},
	{
		id: 5,
		category: 'Навчання',
		title: 'Неправильно — правильно: довідник зі слововживання',
		excerpt:
			'Практичний посібник з культури мовлення: розбір типових помилок, правильне вживання іменників, дієслів та прийменників в українській мові.',
		date: '10 Березня, 2026',
		readTime: '10 хв',
		image:
			'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop',
		externalUrl: 'http://nepravylno-pravylno.wikidot.com/'
	},
	{
		id: 6,
		category: 'Логіка',
		title: 'Дедукція: поняття та приклади',
		excerpt:
			'Дедукція — спосіб логічного виведення, при якому висновки необхідно випливають із заданих посилок; широко застосовується в математиці, філософії й науці (джерело: Вікіпедія).',
		date: '10 Березня, 2026',
		readTime: '5 хв',
		image:
			'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://uk.wikipedia.org/wiki/%D0%94%D0%B5%D0%B4%D1%83%D0%BA%D1%86%D1%96%D1%8F'
	},
	{
		id: 7,
		category: 'Лінгвістика',
		title: 'Назви місяців: таємниці їхнього походження',
		excerpt:
			'Чому січень "січе", а травень став "травнем" лише в минулому столітті? Глибоке дослідження етимології українських назв місяців.',
		date: '10 Березня, 2026',
		readTime: '8 хв',
		image:
			'https://images.unsplash.com/photo-1506784365847-bbad939e9335?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://vseosvita.ua/blogs/nazvy-misiatsiv-ikh-pokhodzhennia-39096.html'
	},
	{
		id: 8,
		category: 'Логіка',
		title: 'Неформальна логіка: принципи та застосування',
		excerpt:
			'Огляд неформальної логіки, аргументації та типових помилок мислення — корисно для розвитку критичного мислення у повсякденних дискусіях (джерело: Вікіпедія).',
		date: '10 Березня, 2026',
		readTime: '7 хв',
		image:
			'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://uk.wikipedia.org/wiki/%D0%9D%D0%B5%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0_%D0%BB%D0%BE%D0%B3%D1%96%D0%BA%D0%B0'
	},
	{
		id: 9,
		category: 'Логіка',
		title: 'Формальна логіка: основи та структури',
		excerpt:
			'Формальна логіка вивчає форми правильного міркування, символічні системи і правила виведення; корисна для математики, інформатики та філософії (джерело: Вікіпедія).',
		date: '10 Березня, 2026',
		readTime: '7 хв',
		image:
			'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop',
		externalUrl:
			'https://uk.wikipedia.org/wiki/%D0%A4%D0%BE%D1%80%D0%BC%D0%B0%D0%BB%D1%8C%D0%BD%D0%B0_%D0%BB%D0%BE%D0%B3%D1%96%D0%BA%D0%B0'
	}
]

const CATEGORIES = ['Всі', 'Лінгвістика', 'Технології', 'Навчання', 'Новини']

export default function BlogPage() {
	const [selectedCategory, setSelectedCategory] = useState('Всі')
	const [searchQuery, setSearchQuery] = useState('')

	const filteredPosts = ALL_POSTS.filter(post => {
		const matchesCategory =
			selectedCategory === 'Всі' || post.category === selectedCategory
		const matchesSearch =
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesCategory && matchesSearch
	})

	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				{/* Hero Section */}
				<section className="pt-32 pb-12 px-4 border-b border-zinc-800/50">
					<div className="max-w-6xl mx-auto text-center">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="text-4xl md:text-6xl font-bold text-white mb-6"
							style={{ fontFamily: 'var(--font-cal-sans)' }}
						>
							Блог
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12"
						>
							Дізнавайтеся першими про новини української лінгвістики, оновлення
							платформи та корисні поради для вивчення мови.
						</motion.p>

						{/* Search & Filter Bar */}
						<div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm">
							<div className="relative w-full md:w-72">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
								<input
									type="text"
									placeholder="Пошук статей..."
									value={searchQuery}
									onChange={e => setSearchQuery(e.target.value)}
									className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
								/>
							</div>

							<div className="flex flex-wrap justify-center gap-2">
								{CATEGORIES.map(category => (
									<button
										key={category}
										onClick={() => setSelectedCategory(category)}
										className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
											selectedCategory === category
												? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
												: 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
										}`}
									>
										{category}
									</button>
								))}
							</div>
						</div>
					</div>
				</section>

				{/* Posts Grid */}
				<section className="py-20 px-4">
					<div className="max-w-6xl mx-auto">
						{filteredPosts.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
								{filteredPosts.map((post, index) => (
									<motion.article
										key={post.id}
										initial={{ opacity: 0, y: 20 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{ delay: index * 0.1 }}
										className="group flex flex-col bg-zinc-900/40 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
									>
										{/* Image Container */}
										<div className="relative h-52 overflow-hidden">
											<img
												src={post.image}
												alt={post.title}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
											/>
											<div className="absolute top-4 left-4">
												<span className="px-3 py-1 rounded-full bg-emerald-500/90 text-black text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
													{post.category}
												</span>
											</div>
										</div>

										{/* Content */}
										<div className="p-6 flex flex-col grow">
											<div className="flex items-center gap-4 text-zinc-500 text-[11px] mb-4">
												<div className="flex items-center gap-1">
													<Calendar className="w-3 h-3" />
													{post.date}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{post.readTime}
												</div>
											</div>

											<h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
												{post.title}
											</h3>

											<p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">
												{post.excerpt}
											</p>

											<div className="mt-auto">
												{post.externalUrl ? (
													<a
														href={post.externalUrl}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium group/btn transition-colors"
													>
														Читати далі
														<ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
													</a>
												) : (
													<Button
														variant="link"
														className="text-emerald-400 hover:text-emerald-300 p-0 h-auto group/btn"
													>
														Читати далі
														<ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
													</Button>
												)}
											</div>
										</div>
									</motion.article>
								))}
							</div>
						) : (
							<div className="text-center py-20">
								<p className="text-zinc-500 text-lg">
									Статей не знайдено за вашим запитом.
								</p>
								<Button
									variant="outline"
									onClick={() => {
										setSelectedCategory('Всі')
										setSearchQuery('')
									}}
									className="mt-4 rounded-full border-zinc-800 text-zinc-400 hover:text-white"
								>
									Скинути фільтри
								</Button>
							</div>
						)}

						{/* Load More */}
						{filteredPosts.length > 0 && (
							<div className="mt-20 text-center">
								<Button
									variant="outline"
									size="lg"
									className="rounded-full px-10 h-14 text-base font-medium border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white hover:border-zinc-700 bg-transparent"
								>
									Завантажити більше
								</Button>
							</div>
						)}
					</div>
				</section>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
