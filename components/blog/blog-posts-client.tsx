'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Post } from '@/lib/notion'

const CATEGORIES = ['Всі', 'Лінгвістика', 'Технології', 'Навчання', 'Новини']

export function BlogPostsClient({ initialPosts }: { initialPosts: Post[] }) {
	const [selectedCategory, setSelectedCategory] = useState('Всі')
	const [searchQuery, setSearchQuery] = useState('')

	const filteredPosts = initialPosts.filter(post => {
		const matchesCategory =
			selectedCategory === 'Всі' || post.category === selectedCategory
		const matchesSearch =
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.summary.toLowerCase().includes(searchQuery.toLowerCase())
		return matchesCategory && matchesSearch
	})

	return (
		<>
			{/* Search & Filter Bar */}
			<section className="pt-8 pb-12 px-4 border-b border-zinc-800/50">
				<div className="max-w-4xl mx-auto bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6">
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
									<div className="relative h-52 overflow-hidden bg-zinc-800">
										{post.image ? (
											<img
												src={post.image}
												alt={post.title}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900/50 font-display text-2xl p-4 text-center">
												{post.title}
											</div>
										)}
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
												{new Date(post.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-3 h-3" />
												5 хв
											</div>
										</div>

										<h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">
											{post.title}
										</h3>

										<p className="text-zinc-400 text-sm mb-6 line-clamp-3 leading-relaxed">
											{post.summary}
										</p>

										<div className="mt-auto">
											<Link
												href={`/blog/${post.slug}`}
												className="inline-flex items-center text-emerald-400 hover:text-emerald-300 text-sm font-medium group/btn transition-colors"
											>
												Читати далі
												<ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
											</Link>
										</div>
									</div>
								</motion.article>
							))}
						</div>
					) : (
						<div className="text-center py-20">
							<p className="text-zinc-500 text-lg">Статей не знайдено.</p>
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
				</div>
			</section>
		</>
	)
}
