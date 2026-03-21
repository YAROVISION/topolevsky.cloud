'use client'

import { analyzeDocument } from '@/app/actions/logoskop'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import {
	AlertCircle,
	CheckCircle2,
	Download,
	Loader2,
	Play,
	ShieldAlert
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

export default function LogoskopPage() {
	const { data: session, status } = useSession()
	const [input, setInput] = useState('')
	const [selectedType, setSelectedType] = useState('auto')
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [result, setResult] = useState<string | null>(null)
	const [isDownloading, setIsDownloading] = useState(false)
	const [useKcs, setUseKcs] = useState(false)
	const [kcsSources, setKcsSources] = useState<
		Array<{ caseNumber: string; date: string; url: string; score: number }>
	>([])
	const resultsRef = useRef<HTMLDivElement>(null)
	const printRef = useRef<HTMLDivElement>(null)

	if (status === 'loading') {
		return (
			<div className="min-h-screen bg-black flex items-center justify-center">
				<div className="text-white animate-pulse">Завантаження...</div>
			</div>
		)
	}

	if (!session) {
		return (
			<SmoothScroll>
				<main className="min-h-screen bg-black">
					<Navbar />
					<div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
						<div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full">
							<h2 className="text-2xl font-bold text-white mb-4">
								Доступ обмежено
							</h2>
							<p className="text-zinc-400 mb-8">
								Ця сторінка доступна тільки для зареєстрованих користувачів.
								Будь ласка, увійдіть у свій акаунт або зареєструйтеся, щоб
								продовжити.
							</p>
							<div className="flex flex-col gap-3">
								<Button
									asChild
									className="w-full"
								>
									<Link href="/login">Увійти</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									className="w-full text-white border-zinc-800 hover:bg-zinc-800"
								>
									<Link href="/signup">Зареєструватися</Link>
								</Button>
							</div>
						</div>
					</div>
					<Footer />
				</main>
			</SmoothScroll>
		)
	}

	const handleAnalyze = async () => {
		if (!input.trim()) {
			toast.error('Будь ласка, вставте текст документа')
			return
		}
		if (input.length < 100) {
			toast.error('Текст занадто короткий для якісного аналізу')
			return
		}

		setIsAnalyzing(true)
		setResult(null)
		setKcsSources([])

		try {
			if (useKcs) {
				toast.info('Пошук релевантних рішень ККС...')
			}

			const res = await analyzeDocument(input, selectedType, useKcs)
			setResult(res.analysis)

			if (res.sources && res.sources.length > 0) {
				setKcsSources(res.sources)
				toast.success(`Знайдено ${res.sources.length} рішень ККС`)
			}
		} catch (error) {
			toast.error('Помилка аналізу. Спробуйте пізніше.')
		} finally {
			setIsAnalyzing(false)
		}
	}

	const downloadPDF = async () => {
		if (!printRef.current || !result) return
		setIsDownloading(true)
		try {
			const canvas = await html2canvas(printRef.current, {
				backgroundColor: '#ffffff',
				scale: 2,
				logging: false,
				useCORS: true,
				onclone: clonedDoc => {
					// Видаляємо всі стилі сайту в клонованому документі,
					// щоб html2canvas не намагався розпарсити oklch/lab кольори
					const styles = clonedDoc.querySelectorAll(
						'style, link[rel="stylesheet"]'
					)
					styles.forEach(s => s.remove())
				}
			})

			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF('p', 'mm', 'a4')

			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = pdf.internal.pageSize.getHeight()
			const imgWidth = canvas.width
			const imgHeight = canvas.height

			const ratio = pdfWidth / imgWidth
			const finalImgHeight = imgHeight * ratio

			let heightLeft = finalImgHeight
			let position = 0

			// Додаємо першу сторінку
			pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight)
			heightLeft -= pdfHeight

			// Додаємо наступні сторінки, якщо контент задовгий
			while (heightLeft > 0) {
				position = heightLeft - finalImgHeight
				pdf.addPage()
				pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight)
				heightLeft -= pdfHeight
			}

			pdf.save(`logoskop-analiz-${new Date().toISOString().split('T')[0]}.pdf`)
			toast.success('PDF скачано успішно')
		} catch (error) {
			console.error('PDF Error:', error)
			toast.error('Помилка при створенні PDF')
		} finally {
			setIsDownloading(false)
		}
	}

	const parseSection = (text: string, tag: string) => {
		const re = new RegExp(`===${tag}===\\s*([\\s\\S]*?)(?====|$)`)
		const m = text.match(re)
		return m ? m[1].trim() : ''
	}

	const getScoreInfo = (score: number) => {
		if (score <= 40)
			return { label: 'КРИТИЧНИЙ', color: 'text-red-500', badge: 'destructive' }
		if (score <= 70)
			return {
				label: 'ЗАДОВІЛЬНИЙ',
				color: 'text-yellow-500',
				badge: 'warning'
			}
		return { label: 'ЯКІСНИЙ', color: 'text-emerald-500', badge: 'success' }
	}

	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-4xl mx-auto">
						<div className="mb-8">
							<h1
								className="text-4xl font-bold text-white mb-2"
								style={{ fontFamily: 'var(--font-cal-sans), sans-serif' }}
							>
								Логоскоп
							</h1>
							<p className="text-zinc-400">
								Аналіз процесуальних документів кримінального провадження за КПК
								України.
							</p>
						</div>

						<div className="space-y-6">
							<div>
								<label className="text-[10px] uppercase tracking-[3px] text-zinc-500 mb-3 block">
									Тип документа
								</label>
								<Tabs
									defaultValue="auto"
									onValueChange={setSelectedType}
									className="w-full"
								>
									<TabsList className="bg-zinc-900 border border-zinc-800 p-1 h-auto flex-wrap justify-start">
										{[
											{ id: 'auto', label: 'Автовизначення' },
											{ id: 'suspicion', label: 'Підозра' },
											{ id: 'verdict', label: 'Вирок' },
											{ id: 'act', label: 'Обвинувальний акт' },
											{ id: 'ruling', label: 'Ухвала' }
										].map(t => (
											<TabsTrigger
												key={t.id}
												value={t.id}
												className="px-4 py-2 text-xs uppercase tracking-wider data-[state=active]:bg-emerald-500 data-[state=active]:text-black"
											>
												{t.label}
											</TabsTrigger>
										))}
									</TabsList>
								</Tabs>
							</div>

							<div>
								<label className="text-[10px] uppercase tracking-[3px] text-zinc-500 mb-3 block">
									Текст документа
								</label>
								<Textarea
									placeholder="Вставте текст процесуального документа для аналізу..."
									className="min-h-75 bg-zinc-900/50 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50"
									value={input}
									onChange={e => setInput(e.target.value)}
								/>
							</div>

							<div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
								<div className="mr-4">
									<p className="text-xs uppercase tracking-widest text-zinc-200">
										Порівняння з практикою ККС ВС
									</p>
									<p className="text-[11px] text-zinc-500 mt-1">
										Автоматичний пошук релевантних рішень Касаційного суду
									</p>
								</div>
								<button
									onClick={() => setUseKcs(!useKcs)}
									className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
										useKcs ? 'bg-emerald-500' : 'bg-zinc-700'
									}`}
								>
									<span
										className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${
											useKcs ? 'left-1' : 'left-7'
										}`}
									/>
								</button>
							</div>

							<Button
								onClick={handleAnalyze}
								disabled={isAnalyzing}
								className="w-full py-6 text-sm uppercase tracking-[3px] bg-transparent border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all group"
							>
								{isAnalyzing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Аналіз...
									</>
								) : (
									<>
										<Play className="mr-2 h-4 w-4 fill-current group-hover:fill-black" />
										Запустити аналіз
									</>
								)}
							</Button>

							{result && (
								<div
									ref={resultsRef}
									className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
								>
									<Accordion
										type="single"
										collapsible
										defaultValue="SCORE"
										className="w-full space-y-4"
									>
										{/* Блок 00: Загальна оцінка */}
										<AccordionItem
											value="SCORE"
											className="border border-zinc-800 bg-zinc-900/40 rounded-xl px-4 overflow-hidden"
										>
											<AccordionTrigger className="hover:no-underline py-4">
												<div className="flex items-center gap-3 text-left">
													<span className="text-[10px] text-emerald-500 font-mono">
														00
													</span>
													<span className="text-xs uppercase tracking-widest text-zinc-200">
														ЗАГАЛЬНА ОЦІНКА ТА ТИП ДОКУМЕНТА
													</span>
													<Badge
														className={`text-[9px] h-5 border ${
															getScoreInfo(
																parseInt(parseSection(result, 'SCORE')) || 0
															).badge === 'destructive'
																? 'border-red-500/50 text-red-500 bg-red-500/10'
																: getScoreInfo(
																			parseInt(parseSection(result, 'SCORE')) ||
																				0
																	  ).badge === 'warning'
																	? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/10'
																	: 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10'
														}`}
														variant="outline"
													>
														{
															getScoreInfo(
																parseInt(parseSection(result, 'SCORE')) || 0
															).label
														}
													</Badge>
												</div>
											</AccordionTrigger>
											<AccordionContent className="pb-6 pt-2 border-t border-zinc-800/50">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
													<div>
														<label className="text-[10px] uppercase tracking-[2px] text-zinc-500 mb-2 block">
															Тип документа
														</label>
														<div className="text-zinc-200 font-medium text-sm whitespace-pre-wrap leading-relaxed">
															{parseSection(result, 'ТИPDOC')}
														</div>
													</div>
													<div>
														<label className="text-[10px] uppercase tracking-[2px] text-zinc-500 mb-2 block">
															Індекс якості
														</label>
														<div
															className={`text-2xl font-bold leading-tight ${getScoreInfo(parseInt(parseSection(result, 'SCORE')) || 0).color}`}
															style={{ fontFamily: 'var(--font-cal-sans), sans-serif' }}
														>
															{parseSection(result, 'SCORE')}
														</div>
													</div>
												</div>
											</AccordionContent>
										</AccordionItem>

										{[
											{
												tag: 'РЕКВІЗИТИ',
												title: 'Структурна відповідність КПК',
												icon: <CheckCircle2 className="w-4 h-4" />
											},
											{
												tag: 'ЛОГІКА',
												title: 'Логічні помилки та суперечності',
												icon: <AlertCircle className="w-4 h-4" />
											},
											{
												tag: 'УМОВЧАННЯ',
												title: 'Аналіз умовчань',
												icon: <AlertCircle className="w-4 h-4" />
											},
											{
												tag: 'КОНТРФАКТИКА',
												title: 'Контрфактичний аналіз',
												icon: <ShieldAlert className="w-4 h-4" />
											},
											{
												tag: 'МОВА',
												title: 'Аналіз мови документа',
												icon: <AlertCircle className="w-4 h-4" />
											},
											{
												tag: 'ДОКАЗИ',
												title: 'Аналіз доказової бази',
												icon: <ShieldAlert className="w-4 h-4" />
											},
											{
												tag: 'КВАЛІФІКАЦІЯ',
												title: 'Відповідність кваліфікації',
												icon: <CheckCircle2 className="w-4 h-4" />
											},
											{
												tag: 'ПРАКТИКА ККС',
												title: 'Практика ККС ВС',
												icon: <ShieldAlert className="w-4 h-4" />
											},
											{
												tag: 'ОСКАРЖЕННЯ',
												title: 'Підстави для оскарження',
												icon: <AlertCircle className="w-4 h-4" />
											},
											{
												tag: 'ВИСНОВКИ',
												title: 'Загальні рекомендації',
												icon: <CheckCircle2 className="w-4 h-4" />
											}
										].map((section, idx) => {
											const content = parseSection(result, section.tag)
											if (!content) return null

											const hasErrors =
												content.includes('🔴') || content.includes('❌')
											const hasWarnings =
												content.includes('🟡') || content.includes('⚠️')

											return (
												<AccordionItem
													key={section.tag}
													value={section.tag}
													className="border border-zinc-800 bg-zinc-900/40 rounded-xl px-4 overflow-hidden"
												>
													<AccordionTrigger className="hover:no-underline py-4">
														<div className="flex items-center gap-3 text-left">
															<span className="text-[10px] text-emerald-500 font-mono">
																0{idx + 1}
															</span>
															<span className="text-xs uppercase tracking-widest text-zinc-200">
																{section.title}
															</span>
															{hasErrors ? (
																<Badge
																	variant="outline"
																	className="ml-2 border-red-500/50 text-red-500 text-[9px] h-5"
																>
																	Порушення
																</Badge>
															) : hasWarnings ? (
																<Badge
																	variant="outline"
																	className="ml-2 border-yellow-500/50 text-yellow-500 text-[9px] h-5"
																>
																	Зауваження
																</Badge>
															) : (
																<Badge
																	variant="outline"
																	className="ml-2 border-emerald-500/50 text-emerald-500 text-[9px] h-5"
																>
																	Норма
																</Badge>
															)}
														</div>
													</AccordionTrigger>
													<AccordionContent className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap pb-6 pt-2 border-t border-zinc-800/50">
														{content}
													</AccordionContent>
												</AccordionItem>
											)
										})}
									</Accordion>

									{kcsSources.length > 0 && (
										<div className="border border-zinc-800 bg-zinc-900/40 rounded-xl p-4">
											<p className="text-[10px] uppercase tracking-[3px] text-emerald-500 mb-3">
												Використані рішення ККС ВС
											</p>
											<div className="space-y-2">
												{kcsSources.map((source, i) => (
													<a
														key={i}
														href={source.url}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors group"
													>
														<div>
															<p className="text-xs text-zinc-200">
																Справа № {source.caseNumber}
															</p>
															<p className="text-[11px] text-zinc-500">
																{source.date}
															</p>
														</div>
														<div className="flex items-center gap-2">
															<span className="text-[10px] text-emerald-500">
																{Math.round(source.score * 100)}% збіг
															</span>
															<span className="text-zinc-600 group-hover:text-zinc-400">
																→
															</span>
														</div>
													</a>
												))}
											</div>
										</div>
									)}

									<Button
										onClick={downloadPDF}
										disabled={isDownloading}
										variant="outline"
										className="w-full mt-6 py-4 text-xs uppercase tracking-wider border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
									>
										{isDownloading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Генерація PDF...
											</>
										) : (
											<>
												<Download className="mr-2 h-4 w-4" />
												Скачати у форматі PDF
											</>
										)}
									</Button>
								</div>
							)}

							{/* Hidden Print Version */}
							{result && (
								<div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
									<div
										ref={printRef}
										style={{
											width: '800px',
											backgroundColor: '#ffffff',
											color: '#111827',
											padding: '40px',
											fontFamily: 'sans-serif'
										}}
									>
										<div style={{ marginBottom: '30px' }}>
											<h1
												style={{
													color: '#059669',
													fontSize: '28px',
													fontWeight: 'bold',
													textTransform: 'uppercase',
													letterSpacing: '2px',
													marginBottom: '10px'
												}}
											>
												Звіт LexLogic Analyzer
											</h1>
											<p style={{ color: '#4b5563', fontSize: '12px' }}>
												Дата аналізу: {new Date().toLocaleDateString('uk-UA')}
											</p>
										</div>

										<div
											style={{
												border: '1px solid #e5e7eb',
												borderRadius: '12px',
												padding: '24px',
												backgroundColor: '#f9fafb',
												marginBottom: '30px'
											}}
										>
											<div
												style={{
													display: 'grid',
													gridTemplateColumns: '1fr 1fr',
													gap: '20px'
												}}
											>
												<div>
													<label
														style={{
															color: '#4b5563',
															fontSize: '10px',
															textTransform: 'uppercase',
															display: 'block',
															marginBottom: '5px'
														}}
													>
														Тип документа
													</label>
													<div
														style={{ color: '#111827', fontWeight: 'medium', whiteSpace: 'pre-wrap' }}
													>
														{parseSection(result, 'ТИPDOC')}
													</div>
												</div>
												<div>
													<label
														style={{
															color: '#4b5563',
															fontSize: '10px',
															textTransform: 'uppercase',
															display: 'block',
															marginBottom: '5px'
														}}
													>
														Індекс якості
													</label>
													<div
														style={{
															color: '#059669',
															fontSize: '24px',
															fontWeight: 'bold'
														}}
													>
														{parseSection(result, 'SCORE')}
													</div>
												</div>
											</div>
										</div>

										{[
											{
												tag: 'РЕКВІЗИТИ',
												title: 'Структурна відповідність КПК'
											},
											{
												tag: 'ЛОГІКА',
												title: 'Логічні помилки та суперечності'
											},
											{ tag: 'ДОКАЗИ', title: 'Аналіз доказової бази' },
											{
												tag: 'КВАЛІФІКАЦІЯ',
												title: 'Відповідність кваліфікації'
											},
											{ tag: 'ОСКАРЖЕННЯ', title: 'Підстави для оскарження' },
											{ tag: 'ВИСНОВКИ', title: 'Загальні рекомендації' }
										].map((s, idx) => {
											const content = parseSection(result, s.tag)
											if (!content) return null
											return (
												<div
													key={s.tag}
													style={{
														border: '1px solid #e5e7eb',
														borderRadius: '12px',
														padding: '20px',
														backgroundColor: '#f9fafb',
														marginBottom: '15px'
													}}
												>
													<div
														style={{
															display: 'flex',
															alignItems: 'center',
															gap: '12px',
															marginBottom: '15px',
															borderBottom: '1px solid #e5e7eb',
															paddingBottom: '10px'
														}}
													>
														<span
															style={{
																color: '#059669',
																fontFamily: 'monospace',
																fontSize: '12px'
															}}
														>
															0{idx + 1}
														</span>
														<span
															style={{
																color: '#111827',
																fontSize: '12px',
																textTransform: 'uppercase',
																letterSpacing: '1px',
																fontWeight: 'bold'
															}}
														>
															{s.title}
														</span>
													</div>
													<div
														style={{
															color: '#374151',
															fontSize: '13px',
															lineHeight: '1.6',
															whiteSpace: 'pre-wrap'
														}}
													>
														{content}
													</div>
												</div>
											)
										})}

										<div
											style={{
												marginTop: '40px',
												borderTop: '1px solid #e5e7eb',
												paddingTop: '20px',
												textAlign: 'center',
												color: '#4b5563',
												fontSize: '10px'
											}}
										>
											LexLogic Analyzer • Автоматизований звіт •{' '}
											{new Date().getFullYear()}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</section>
				<Footer />
			</main>
		</SmoothScroll>
	)
}
