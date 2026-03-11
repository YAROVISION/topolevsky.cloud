'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [subject, setSubject] = useState('')
	const [message, setMessage] = useState('')
	const [loading, setLoading] = useState(false)
	const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(
		null
	)

	function validate() {
		if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
			setStatus({ ok: false, msg: 'Будь ласка, заповніть усі поля.' })
			return false
		}
		// simple email check
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!re.test(email)) {
			setStatus({
				ok: false,
				msg: 'Будь ласка, введіть коректну електронну адресу.'
			})
			return false
		}
		return true
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setStatus(null)
		if (!validate()) return
		setLoading(true)
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, subject, message })
			})
			const data = await res.json()
			if (res.ok) {
				setStatus({ ok: true, msg: data?.message || 'Повідомлення надіслано.' })
				setName('')
				setEmail('')
				setSubject('')
				setMessage('')
			} else {
				setStatus({
					ok: false,
					msg: data?.error || 'Сталася помилка при відправці.'
				})
			}
		} catch (err) {
			setStatus({ ok: false, msg: 'Не вдалося з’єднатися із сервером.' })
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="max-w-6xl mx-auto px-4 py-16">
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
				className="grid grid-cols-1 gap-8"
			>
				<section>
					<h1 className="text-3xl font-semibold text-white mb-4">Контакти</h1>
					<p className="text-zinc-400 mb-6">
						Залиште повідомлення — ми відповімо на вашу електронну пошту.
					</p>

					<form
						onSubmit={handleSubmit}
						aria-label="Форма зворотного зв'язку"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="flex flex-col">
								<span className="text-sm text-zinc-300 mb-2">Ім'я</span>
								<Input
									aria-label="Ім'я"
									value={name}
									onChange={e => setName(e.target.value)}
									placeholder="Ваше ім'я"
								/>
							</label>

							<label className="flex flex-col">
								<span className="text-sm text-zinc-300 mb-2">Email</span>
								<Input
									aria-label="Email"
									value={email}
									onChange={e => setEmail(e.target.value)}
									placeholder="you@example.com"
									type="email"
								/>
							</label>
						</div>

						<div className="mt-4">
							<label className="flex flex-col">
								<span className="text-sm text-zinc-300 mb-2">Тема листа</span>
								<Input
									aria-label="Тема"
									value={subject}
									onChange={e => setSubject(e.target.value)}
									placeholder="Про що ваше повідомлення"
								/>
							</label>
						</div>

						<div className="mt-4">
							<label className="flex flex-col">
								<span className="text-sm text-zinc-300 mb-2">Повідомлення</span>
								<Textarea
									aria-label="Повідомлення"
									value={message}
									onChange={e => setMessage(e.target.value)}
									placeholder="Ваше повідомлення"
								/>
							</label>
						</div>

						<div className="mt-4 flex items-center gap-4">
							<Button
								type="submit"
								disabled={loading}
							>
								{loading ? 'Надсилання...' : 'Надіслати'}
							</Button>
							{status && (
								<div
									role="status"
									aria-live="polite"
									className={`text-sm ${status.ok ? 'text-emerald-400' : 'text-destructive-400'}`}
								>
									{status.msg}
								</div>
							)}
						</div>
					</form>
				</section>
			</motion.div>
		</main>
	)
}
