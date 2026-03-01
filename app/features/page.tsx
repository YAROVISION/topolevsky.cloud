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
import mysql from 'mysql2/promise'
import { SearchToast } from '../../components/search-toast'

const db = mysql.createPool({
	host: '127.0.0.1',
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: 3307,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
})

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Features(props: Props) {
	const searchParams = await props.searchParams
	const parent =
		typeof searchParams.parent === 'string'
			? searchParams.parent
			: 'Категорії'
	const title =
		typeof searchParams.title === 'string'
			? searchParams.title
			: 'Категорія 1'

	const search = typeof searchParams.search === 'string' ? searchParams.search : undefined

	let searchResult: { word: string; level: number } | null = null
	let searchError = false

	if (search) {
		try {
			const [rows] = await db.execute<any[]>(
				'SELECT word, abstraction_level FROM word WHERE word = ? AND abstraction_level IS NOT NULL AND abstraction_level > 0 LIMIT 1',
				[search]
			)
			if (rows.length > 0) {
				const row = rows[0] as any
				searchResult = {
					word: row.word,
					level: row.abstraction_level
				}
			} else {
				searchError = true
			}
		} catch (error) {
			console.error('Database connection or query error:', error)
			searchError = true
		}
	}

	const parentGroup = data.navMain.find(g => g.title === parent)
	const items = parentGroup ? parentGroup.items : Array.from({ length: 24 }).map(() => ({ title: '' }))

	const categoryExamples: Record<string, string> = {}
	
	// Override specific category example if search result matches
	if (searchResult) {
		const categoryKey = `Категорія ${searchResult.level}`
		categoryExamples[categoryKey] = searchResult.word
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
										<BreadcrumbLink href="#">
											{parent}
										</BreadcrumbLink>
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
									<span className="text-sidebar-primary font-semibold">{item.title}</span>
									<span className="text-foreground ml-2">
										{categoryExamples[item.title] || 'пусто'}
									</span>
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
