'use client'

import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { Button } from '@/components/ui/button'
import { useEffect, useRef, useState } from 'react'

export default function LogoskopPage() {
	const [messages, setMessages] = useState([
		{
			id: 1,
			role: 'assistant',
			text: 'Вітаю! Вставте текст, який вас цікавить — я проведу його логічний аналіз і вкажу на логічні помилки.'
		}
	])
	const [input, setInput] = useState('')
	const scrollRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: 'smooth'
		})
	}, [messages])

	function send() {
		const text = input.trim()
		if (!text) return
		const userMsg = { id: Date.now(), role: 'user', text }
		setMessages(prev => [...prev, userMsg])
		setInput('')

		// Mock assistant reply
		setTimeout(() => {
			setMessages(prev => [
				...prev,
				{
					id: Date.now() + 1,
					role: 'assistant',
					text: `Я отримав ваше повідомлення: "${text}". Це демонстраційна відповідь Логоскопа.`
				}
			])
		}, 700)
	}

	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto">
						<h1
							className="text-3xl font-bold text-white mb-4"
							style={{ fontFamily: 'var(--font-cal-sans)' }}
						>
							Логоскоп
						</h1>
						<p className="text-zinc-400 mb-6">
							Інтерактивний демонстраційний помічник — оформлений як діалогове
							вікно.
						</p>

						<div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col h-[60vh]">
							<div
								ref={scrollRef}
								className="flex-1 overflow-y-auto p-2 space-y-3"
							>
								{messages.map(msg => (
									<div
										key={msg.id}
										className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
									>
										<div
											className={`${msg.role === 'user' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-100'} max-w-[80%] px-4 py-2 rounded-2xl`}
										>
											{msg.text}
										</div>
									</div>
								))}
							</div>

							<div className="mt-4 border-t border-zinc-800 pt-4 flex gap-3 items-end">
								<textarea
									value={input}
									onChange={e => setInput(e.target.value)}
									rows={1}
									placeholder="Напишіть повідомлення..."
									className="flex-1 resize-none bg-transparent border border-zinc-800 rounded-xl px-4 py-2 text-white placeholder:text-zinc-500 focus:outline-none"
								/>
								<Button
									onClick={send}
									className="h-10"
								>
									Відправити
								</Button>
							</div>
						</div>
					</div>
				</section>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
