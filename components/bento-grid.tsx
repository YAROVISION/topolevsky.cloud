'use client'

import { motion, useInView } from 'framer-motion'
import { BookOpen, Flower, Flower2, Globe, Music, Notebook } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.1
		}
	}
}

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease:
				typeof window !== 'undefined'
					? require('framer-motion').cubicBezier(0.22, 1, 0.36, 1)
					: 'easeInOut'
		}
	}
}

function SystemStatus() {
	const [dots, setDots] = useState([true, true, true, false, true])

	useEffect(() => {
		const interval = setInterval(() => {
			setDots(prev => prev.map(() => Math.random() > 0.2))
		}, 2000)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="flex items-center gap-2">
			{dots.map((active, i) => (
				<motion.div
					key={i}
					className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
					animate={active ? { scale: [1, 1.2, 1] } : {}}
					transition={{
						duration: 1,
						repeat: Number.POSITIVE_INFINITY,
						delay: i * 0.2
					}}
				/>
			))}
		</div>
	)
}

export function BentoGrid() {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: '-100px' })

	return (
		<section
			id="features"
			className="py-24 px-4"
		>
			<div className="max-w-6xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2
						className="text-3xl sm:text-4xl font-bold text-white mb-4"
						style={{ fontFamily: 'var(--font-instrument-sans)' }}
					>
						Цікаві факти про українську мову
					</h2>
					<p className="text-zinc-400 max-w-2xl mx-auto">
						Лексичне багатство української — це не прикраса, а несуча
						конструкція: саме воно дозволяє мові гнутися, не ламаючись, тягнути
						за собою найскладнішу думку крізь умови, причини й наслідки — і все
						одно дійти до точки чітко й невідворотно.
					</p>
				</motion.div>

				<motion.div
					ref={ref}
					variants={containerVariants}
					initial="hidden"
					animate={isInView ? 'visible' : 'hidden'}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
				>
					{/* Large card - System Status */}
					<motion.div
						variants={itemVariants}
						className="md:col-span-2 group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300 overflow-hidden"
					>
						<div className="flex items-start justify-between mb-8">
							<div>
								<div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
									<Flower2
										className="w-5 h-5 text-zinc-400"
										strokeWidth={1.5}
									/>
								</div>
								<h3 className="text-xl font-semibold text-white mb-2">
									Словник сучасної літературної мови налічує понад 256 000 слів
								</h3>
								<p className="text-zinc-400 text-sm">
									Коли майже половина словника — це іменники, мова говорить сама
									за себе: українська не просто описує дійсність — вона її
									каталогізує, класифікує й зберігає, як бібліотека, що пережила
									століття і не втратила жодної полиці.
								</p>
							</div>
							<SystemStatus />
						</div>
						<div className="grid grid-cols-4 gap-4">
							{[
								{ label: 'Іменників', value: '40-45%' },
								{ label: 'Прикметників', value: '15-20%' },
								{ label: 'Дієслів', value: '20-25%' },
								{ label: 'Прислівників', value: '5-8%' }
							].map(stat => (
								<div
									key={stat.label}
									className="text-center"
								>
									<div className="text-2xl font-bold text-white mb-1">
										{stat.value}
									</div>
									<div className="text-xs text-zinc-500">{stat.label}</div>
								</div>
							))}
						</div>
					</motion.div>

					{/* Command Palette */}
					<motion.div
						variants={itemVariants}
						className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
					>
						<div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
							<Music
								className="w-5 h-5 text-zinc-400"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Мелодійність
						</h3>
						<p className="text-zinc-400 text-sm mb-6">
							У 1934 році на Міжнародному конкурсі мов у Парижі українська
							посіла третє місце за красою і мелодійністю після французької та
							перської (фарсі).
						</p>
						<div className="flex items-center justify-center gap-2 w-full overflow-hidden mx-auto">
							{[...Array(9)].map((_, i) => (
								<Flower
									key={i}
									className="w-6 h-6 text-zinc-400 shrink-0"
									strokeWidth={1.5}
								/>
							))}
						</div>
					</motion.div>

					{/* Analytics */}
					<motion.div
						variants={itemVariants}
						className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
					>
						<div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
							<Globe
								className="w-5 h-5 text-zinc-400"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Запозичення
						</h3>
						<p className="text-zinc-400 text-sm mb-4">
							Близько 10–15% сучасної лексики — запозичення, переважно з латини,
							грецької, польської та тюркських мов. Слово майдан — тюркського
							походження і означає «площа».
						</p>
					</motion.div>

					{/* Performance */}
					<motion.div
						variants={itemVariants}
						className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
					>
						<div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
							<BookOpen
								className="w-5 h-5 text-zinc-400"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Вік і походження
						</h3>
						<p className="text-zinc-400 text-sm mb-4">
							Українська мова почала формуватися ще в XI–XIII століттях на
							основі давньоруської, але як окрема мова остаточно склалася до
							XIV–XV століть — тобто їй понад 600 років як самостійній системі.
						</p>
						<div className="flex items-center gap-2 text-emerald-500 text-sm"></div>
					</motion.div>

					{/* Security */}
					<motion.div
						variants={itemVariants}
						className="group relative p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300"
					>
						<div className="p-2 rounded-lg bg-zinc-800 w-fit mb-4">
							<Notebook
								className="w-5 h-5 text-zinc-400"
								strokeWidth={1.5}
							/>
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">
							Цифрова епоха
						</h3>
						<p className="text-zinc-400 text-sm mb-4">
							Після 2022 року кількість запитів у Google українською мовою
							зросла в рази — навіть серед тих, хто раніше спілкувався переважно
							російською.
						</p>
						<div className="flex items-center gap-2"></div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	)
}
