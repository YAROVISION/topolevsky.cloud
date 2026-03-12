import { data } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import { NavBreadcrumb } from '@/components/nav-breadcrumb'
import { Navbar } from '@/components/navbar'
import { SearchForm } from '@/components/search-form'
import { SmoothScroll } from '@/components/smooth-scroll'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AICategorization, categorizeWord } from '@/lib/ai'
import { ensureTunnel } from '@/lib/db-tunnel'
import mysql from 'mysql2/promise'
import { Suspense } from 'react'
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
	properties?: {
		part_of_language: string
		creature: string
		genus: string
		number: string
		person: string
		case: string
		verb_kind: string
		dievidmina: string
		class: string
		sub_role: string
		comparison: string
		tense: string
		mood: string
		variation: string
	}
} | null> {
	await ensureTunnel()
	const isProd = process.env.NODE_ENV === 'production'
	const connection = await withTimeout(
		mysql.createConnection({
			host: isProd ? process.env.DB_HOST : '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: isProd ? 3306 : 3307,
			connectTimeout: 4000
		}),
		5000
	)
	try {
		// Шукаємо слово. Спершу пробуємо знайти те, де вже є рівень, або просто будь-яке співпадіння.
		const [rows] = await connection.execute<any[]>(
			`SELECT 
				id, word, abstraction_level,
				part_of_language, creature, genus, number, person, 
				kind as 'case', verb_kind, dievidmina, class, 
				sub_role, comparison, tense, mood, variation
			 FROM word 
			 WHERE word = ? 
			 ORDER BY abstraction_level DESC 
			 LIMIT 1`,
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
				})),
				properties: {
					part_of_language: mainWord.part_of_language,
					creature: mainWord.creature,
					genus: mainWord.genus,
					number: mainWord.number,
					person: mainWord.person,
					case: mainWord.case,
					verb_kind: mainWord.verb_kind,
					dievidmina: mainWord.dievidmina,
					class: mainWord.class,
					sub_role: mainWord.sub_role,
					comparison: mainWord.comparison,
					tense: mainWord.tense,
					mood: mainWord.mood,
					variation: mainWord.variation
				}
			}
		}
		return null
	} finally {
		await connection.end().catch(() => {})
	}
}

async function getLevelNames(): Promise<Record<number, string>> {
	await ensureTunnel()
	const isProd = process.env.NODE_ENV === 'production'
	const connection = await withTimeout(
		mysql.createConnection({
			host: isProd ? process.env.DB_HOST : '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: isProd ? 3306 : 3307,
			connectTimeout: 4000
		}),
		5000
	)
	try {
		const [rows] = await connection.execute<any[]>(
			'SELECT level, level_name_ua FROM abstraction_levels'
		)
		const mapping: Record<number, string> = {}
		rows.forEach(row => {
			mapping[row.level] = row.level_name_ua
		})
		return mapping
	} catch (err) {
		console.error('Error fetching level names:', err)
		return {}
	} finally {
		await connection.end().catch(() => {})
	}
}

async function saveToDB(word: string, aiData: AICategorization): Promise<void> {
	await ensureTunnel()
	const isProd = process.env.NODE_ENV === 'production'
	const connection = await withTimeout(
		mysql.createConnection({
			host: isProd ? process.env.DB_HOST : '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
			port: isProd ? 3306 : 3307,
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

	const levelNames = await getLevelNames()

	let searchResult: {
		word: string
		level: number
		relations: { word: string; level: number }[]
		properties?: {
			part_of_language: string
			creature: string
			genus: string
			number: string
			person: string
			case: string
			verb_kind: string
			dievidmina: string
			class: string
			sub_role: string
			comparison: string
			tense: string
			mood: string
			variation: string
		}
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
				<Navbar />

				<SidebarProvider
					defaultOpen={false}
					className="pt-20"
				>
					{/* <AppSidebar /> */}
					<SidebarInset>
						<header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
							{/* <SidebarTrigger className="-ml-1" /> */}
							<NavBreadcrumb
								parent={parent}
								title={title}
							/>
							<div className="ml-auto flex items-center gap-2">
								<Suspense fallback={null}>
									<SearchForm className="w-full max-w-75" />
								</Suspense>
							</div>
						</header>
						<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-4">
							{[
								items.slice(0, Math.ceil(items.length / 2)),
								items.slice(Math.ceil(items.length / 2))
							].map((columnItems, colIndex) => (
								<div
									key={colIndex}
									className="flex flex-col gap-4"
								>
									{columnItems.map((item, index) => {
										const levelMatch = item.title.match(/\d+/)
										const levelNum = levelMatch ? parseInt(levelMatch[0]) : null
										const levelNameUa = levelNum ? levelNames[levelNum] : null

										return (
											<div
												key={index}
												className="bg-muted/50 min-h-12 w-full rounded-lg p-4 font-medium"
											>
												<div className="flex flex-col gap-1 mb-2">
													<span className="text-sidebar-primary font-semibold">
														{item.title}
													</span>
													{levelNameUa && (
														<span className="text-xs text-muted-foreground italic">
															{levelNameUa}
														</span>
													)}
												</div>
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
																	<span className="text-foreground/30 ml-2">
																		•
																	</span>
																)}
															</span>
														))
													) : (
														<span className="text-foreground/50">пусто</span>
													)}
												</div>
											</div>
										)
									})}
								</div>
							))}
						</div>
						<div className="p-4 pt-0">
							<div className="bg-muted/50 min-h-12 w-full rounded-lg p-4 font-medium">
								<span className="text-sidebar-primary font-semibold block mb-2">
									Морфологічний розбір слова
								</span>
								<div className="text-foreground">
									{search ? (
										<div className="flex flex-col gap-4">
											<div className="flex flex-col gap-1">
												<span className="text-2xl font-bold">{search}</span>
												{searchResult?.properties?.part_of_language &&
													searchResult.properties.part_of_language !== '-' && (
														<span className="text-sidebar-primary font-medium italic">
															{searchResult.properties.part_of_language}
														</span>
													)}
											</div>

											{searchResult?.properties && (
												<div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 text-sm">
													{Object.entries(searchResult.properties)
														.filter(([key, value]) => key !== 'part_of_language' && value && value !== '-')
														.map(([key, value]) => {
															const labels: Record<string, string> = {
																creature: 'Істота/неістота',
																genus: 'Рід',
																number: 'Число',
																person: 'Особа',
																case: 'Відмінок',
																verb_kind: 'Вид дієслова',
																dievidmina: 'Дієвідміна',
																class: 'Розряд',
																sub_role: 'Роль',
																comparison: 'Ступінь порівняння',
																tense: 'Час',
																mood: 'Спосіб',
																variation: 'Відміна'
															}
															return (
																<div
																	key={key}
																	className="flex flex-col gap-0.5"
																>
																	<span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
																		{labels[key] || key}
																	</span>
																	<span className="text-foreground">{value}</span>
																</div>
															)
														})}
												</div>
											)}
											{!searchResult?.properties && searchResult && (
												<span className="text-muted-foreground text-sm italic">
													Детальні властивості не знайдені в БД...
												</span>
											)}
											{!searchResult && (
												<span className="text-muted-foreground text-sm italic">
													Тут буде відображено морфологічний розбір...
												</span>
											)}
										</div>
									) : (
										"Тут буде відображено морфологічний розбір..."
									)}
								</div>
							</div>
						</div>
					</SidebarInset>
				</SidebarProvider>
				<Footer />
				{searchError && <SearchToast word={search} />}
			</main>
		</SmoothScroll>
	)
}
