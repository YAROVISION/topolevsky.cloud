import { AppSidebar, data } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import { SmoothScroll } from '@/components/smooth-scroll'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger
} from '@/components/ui/sidebar'
import { AICategorization, categorizeWord } from '@/lib/ai'
import { ensureTunnel } from '@/lib/db-tunnel'
import mysql from 'mysql2/promise'
import { SearchToast } from '../../components/search-toast'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return Promise.race([
		promise,
		new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error(`DB timeout after ${ms}ms`)), ms)
		)
	])
}

async function queryDB(search: string): Promise<{
	word: string
	level: number
	relations: { word: string; level: number }[]
} | null> {
	await ensureTunnel()
	const connection = await withTimeout(
		mysql.createConnection({
			host: '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: 3307,
			connectTimeout: 4000
		}),
		5000
	)
	try {
		// Шукаємо слово. Спершу пробуємо знайти те, де вже є рівень, або просто будь-яке співпадіння.
		const [rows] = await connection.execute<any[]>(
			'SELECT id, word, abstraction_level FROM word WHERE word = ? ORDER BY abstraction_level DESC LIMIT 1',
			[search]
		)

		if (rows.length > 0) {
			const mainWord = rows[0]
			const level = mainWord.abstraction_level || 0

			// Отримуємо всі ID для цього слова, щоб знайти всі можливі зв'язки
			const [allWordIds] = await connection.execute<any[]>(
				'SELECT id FROM word WHERE word = ?',
				[search]
			)
			const ids = allWordIds.map(row => row.id)

			// Отримуємо всі пов'язані слова (гіперніми та гіпоніми) для будь-якого з цих ID
			const [relRows] = await connection.execute<any[]>(
				`SELECT DISTINCT w.word, w.abstraction_level 
				 FROM word w
				 JOIN word_relations r ON (r.hypernym_id = w.id AND r.hyponym_id IN (${ids.join(',')})) 
				    OR (r.hyponym_id = w.id AND r.hypernym_id IN (${ids.join(',')}))
				 WHERE w.abstraction_level IS NOT NULL AND w.abstraction_level > 0`,
				[]
			)

			return {
				word: mainWord.word,
				level: level,
				relations: relRows.map(r => ({
					word: r.word,
					level: r.abstraction_level
				}))
			}
		}
		return null
	} finally {
		await connection.end().catch(() => {})
	}
}

async function saveToDB(word: string, aiData: AICategorization): Promise<void> {
	await ensureTunnel()
	const connection = await withTimeout(
		mysql.createConnection({
			host: '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: 3307,
			connectTimeout: 4000
		}),
		15000
	)
	try {
		// 1. Оновлюємо рівень абстракції для всіх входжень цього слова (їх може бути кілька через різні форми)
		await connection.execute(
			'UPDATE word SET abstraction_level = ? WHERE word = ?',
			[aiData.level, word]
		)

		// 2. Отримуємо ID основного слова
		const [wordRows] = await connection.execute<any[]>(
			'SELECT id FROM word WHERE word = ? LIMIT 1',
			[word]
		)

		// Якщо слова взагалі немає в базі, ми не можемо створити зв'язки в word_relations,
		// оскільки вони зав'язані на ID з таблиці word.
		if (wordRows.length === 0) {
			console.log(`Word "${word}" not found in DB, skipping relations save.`)
			return
		}

		const mainWordId = wordRows[0].id

		// Функція для забезпечення існування слова (тільки через UPDATE) та створення зв'язку
		const ensureRelation = async (
			relWord: string,
			relLevel: number,
			isHyper: boolean
		) => {
			// Оновлюємо рівень для пов'язаного слова, якщо воно є
			await connection.execute(
				'UPDATE word SET abstraction_level = ? WHERE word = ? AND abstraction_level IS NULL',
				[relLevel, relWord]
			)

			const [rows] = await connection.execute<any[]>(
				'SELECT id FROM word WHERE word = ? LIMIT 1',
				[relWord]
			)

			if (rows.length > 0) {
				const relatedId = rows[0].id
				const hyperId = isHyper ? relatedId : mainWordId
				const hypoId = isHyper ? mainWordId : relatedId

				// Перевіряємо чи вже існує такий зв'язок
				const [rel] = await connection.execute<any[]>(
					'SELECT id FROM word_relations WHERE hypernym_id = ? AND hyponym_id = ?',
					[hyperId, hypoId]
				)

				if (rel.length === 0) {
					await connection.execute(
						'INSERT INTO word_relations (hypernym_id, hyponym_id, relationship_type) VALUES (?, ?, ?)',
						[hyperId, hypoId, isHyper ? 'hypernym' : 'hyponym']
					)
				}
			}
		}

		// 3. Обробляємо гіперніми
		for (const hyper of aiData.hypernyms) {
			await ensureRelation(hyper.word, hyper.level, true)
		}

		// 4. Обробляємо гіпоніми
		for (const hypo of aiData.hyponyms) {
			await ensureRelation(hypo.word, hypo.level, false)
		}
	} catch (err) {
		console.error('Error in saveToDB:', err)
	} finally {
		await connection.end().catch(() => {})
	}
}

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Features(props: Props) {
	const searchParams = await props.searchParams
	const parent =
		typeof searchParams.parent === 'string' ? searchParams.parent : 'Категорії'
	const title =
		typeof searchParams.title === 'string' ? searchParams.title : 'Категорія 1'

	const search =
		typeof searchParams.search === 'string' ? searchParams.search : undefined

	let searchResult: {
		word: string
		level: number
		relations: { word: string; level: number }[]
	} | null = null
	let searchError = false

	if (search) {
		try {
			searchResult = await queryDB(search)

			// Якщо слово є в базі, але у нього немає рівня абстракції (level <= 0)
			// АБО якщо у слова є рівень, але взагалі немає зв'язків (relations.length === 0),
			// то ми все одно звертаємось до ШІ, щоб доповнити дані.
			if (
				!searchResult ||
				searchResult.level <= 0 ||
				searchResult.relations.length === 0
			) {
				// Запитуємо ШІ для отримання/оновлення даних
				const aiData = await categorizeWord(search)
				if (aiData) {
					// Зберігаємо в базу категорію та взаємозв'язки
					await saveToDB(search, aiData)

					// Пробуємо отримати оновлені дані з бази (зі зв'язками)
					const updatedResult = await queryDB(search)

					if (updatedResult && updatedResult.level > 0) {
						searchResult = updatedResult
					} else {
						// Fallback: показуємо результати ШІ, якщо БД ще не оновилась
						searchResult = {
							word: search,
							level: aiData.level,
							relations: [
								...aiData.hypernyms.map(h => ({
									word: h.word,
									level: h.level
								})),
								...aiData.hyponyms.map(h => ({ word: h.word, level: h.level }))
							]
						}
					}
				} else if (!searchResult) {
					searchError = true
				}
			}
		} catch (error) {
			console.error('Database connection or query error:', error)
			searchError = true
		}
	}

	const parentGroup = data.navMain.find(g => g.title === parent)
	const items = parentGroup
		? parentGroup.items
		: Array.from({ length: 24 }).map(() => ({ title: '' }))

	const categoryWords: Record<string, { word: string; isMain: boolean }[]> = {}

	// Групуємо слова за категоріями
	if (searchResult) {
		// Додаємо основне слово
		const mainKey = `Категорія ${searchResult.level}`
		if (!categoryWords[mainKey]) categoryWords[mainKey] = []
		categoryWords[mainKey].push({ word: searchResult.word, isMain: true })

		// Додаємо пов'язані слова
		searchResult.relations.forEach(rel => {
			const relKey = `Категорія ${rel.level}`
			if (!categoryWords[relKey]) categoryWords[relKey] = []
			// Уникаємо дублікатів
			if (!categoryWords[relKey].find(w => w.word === rel.word)) {
				categoryWords[relKey].push({ word: rel.word, isMain: false })
			}
		})
	}

	return (
		<SmoothScroll>
			<main className="min-h-screen">
				{/* <Navbar /> */}

				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mr-2 h-4"
							/>
							<Breadcrumb>
								<BreadcrumbList>
									<BreadcrumbItem className="hidden md:block">
										<BreadcrumbLink href="#">{parent}</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator className="hidden md:block" />
									<BreadcrumbItem>
										<BreadcrumbPage>{title}</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<div className="flex flex-1 flex-col gap-4 p-4">
							{items.map((item, index) => (
								<div
									key={index}
									className="bg-muted/50 min-h-12 w-full rounded-lg p-4 font-medium"
								>
									<span className="text-sidebar-primary font-semibold">
										{item.title}
									</span>
									<div className="ml-2 inline-flex flex-wrap gap-2">
										{categoryWords[item.title] &&
										categoryWords[item.title].length > 0 ? (
											categoryWords[item.title].map((wordObj, i) => (
												<span
													key={i}
													className={
														wordObj.isMain
															? 'text-green-500 font-bold'
															: 'text-foreground'
													}
												>
													{wordObj.word}
													{i < categoryWords[item.title].length - 1 && (
														<span className="text-foreground/30 ml-2">•</span>
													)}
												</span>
											))
										) : (
											<span className="text-foreground/50">пусто</span>
										)}
									</div>
								</div>
							))}
						</div>
					</SidebarInset>
				</SidebarProvider>
				<Footer />
				{searchError && <SearchToast word={search} />}
			</main>
		</SmoothScroll>
	)
}
