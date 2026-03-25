import { NotionToMarkdown } from 'notion-to-md'
import { Client } from '@notionhq/client'
import { generateAIPreview } from './ai-covers'

// Ми все ще використовуємо Client для notion-to-md, 
// але запити до бази робимо через нативний fetch
const notionClient = new Client({
	auth: process.env.NOTION_TOKEN?.trim(),
})

const n2m = new NotionToMarkdown({ notionClient })

export interface Post {
	id: string
	title: string
	slug: string
	date: string
	summary: string
	category: string
	image: string | null
}

async function notionFetch(path: string, body?: any) {
	const token = process.env.NOTION_TOKEN?.trim()
	const url = `https://api.notion.com/v1/${path}`
	
	console.log(`[Notion Fetch] ${body ? 'POST' : 'GET'} ${url}`)
	
	const response = await fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28',
			'Content-Type': 'application/json',
		},
		body: body ? JSON.stringify(body) : undefined,
		next: { revalidate: 3600 }, // Кешування на рівні Next.js
	})

	const data = await response.json()
	if (!response.ok) {
		console.error(`Notion API Error [${response.status}]:`, JSON.stringify(data, null, 2))
		throw new Error(data.message || `Notion API error: ${response.status}`)
	}
	return data
}

// Кеш у пам'яті сервера (для миттєвої роботи в режимі розробки)
let cachedPosts: { data: Post[]; timestamp: number } | null = null
const CACHE_TTL = 10 * 60 * 1000 // 10 хвилин

export async function getPublishedPosts(): Promise<Post[]> {
	console.log('[Notion Debug] getPublishedPosts() called')
	// Якщо кеш свіжий, віддаємо його без запитів до Notion та AI
	if (cachedPosts && (Date.now() - cachedPosts.timestamp < CACHE_TTL)) {
		console.log('[Notion Cache] Serving from memory cache...')
		return cachedPosts.data
	}

	const rawDatabaseId = process.env.NOTION_DATABASE_ID || ''
	const databaseId = rawDatabaseId.includes('-') && rawDatabaseId.length > 32 
		? rawDatabaseId.split('-').pop()?.trim() 
		: rawDatabaseId.trim()

	console.log(`[Notion Debug] Fetching posts for database: ${databaseId}`)

	try {
		const data = await notionFetch(`databases/${databaseId}/query`, {
			filter: {
				property: 'Status',
				select: {
					equals: 'Published',
				},
			},
			sorts: [
				{
					property: 'Date',
					direction: 'descending',
				},
			],
		})

		const posts: Post[] = []
		
		// Обробляємо пости послідовно, щоб не спамити Gemini паралельними запитами
		for (const page of data.results) {
			const title = page.properties.Title?.title[0]?.plain_text || 'Untitled'
			const summary = page.properties.Summary?.rich_text[0]?.plain_text || ''
			let image = page.cover?.external?.url || page.cover?.file?.url || null

			if (!image) {
				// Генеруємо обкладинку лише якщо її немає
				// Оскільки це в циклі, запити будуть йти один за одним
				try {
					image = await generateAIPreview(title, summary)
				} catch (e) {
					console.error(`AI Preview failed for ${title}:`, e)
				}
			}

			posts.push({
				id: page.id,
				title,
				slug: page.properties.Slug?.rich_text[0]?.plain_text || '',
				date: page.properties.Date?.date?.start || '',
				summary,
				category: page.properties.Category?.select?.name || 'Всі',
				image,
			})
		}

		const result = posts
		console.log(`[Notion Debug] Successfully found ${result.length} published posts.`)
		cachedPosts = { data: result, timestamp: Date.now() }
		return result
	} catch (error: any) {
		console.error('[Notion Debug] Fetch error:', error.message)
		return []
	}
}

export async function getPostBySlug(slug: string) {
	if (!slug) return null

	const rawDatabaseId = process.env.NOTION_DATABASE_ID || ''
	const databaseId = rawDatabaseId.includes('-') && rawDatabaseId.length > 32 
		? rawDatabaseId.split('-').pop()?.trim() 
		: rawDatabaseId.trim()

	try {
		const decodedSlug = decodeURIComponent(slug)
		const searchSlug = decodedSlug.toLowerCase()
		
		const data = await notionFetch(`databases/${databaseId}/query`, {
			filter: {
				property: 'Slug',
				rich_text: {
					equals: searchSlug,
				},
			},
		})

		if (data.results.length === 0) return null

		const page = data.results[0]
		const mdblocks = await n2m.pageToMarkdown(page.id)
		const mdString = n2m.toMarkdownString(mdblocks)

		return {
			id: page.id,
			title: page.properties.Title?.title[0]?.plain_text || 'Untitled',
			date: page.properties.Date?.date?.start || '',
			category: page.properties.Category?.select?.name || 'Всі',
			image: page.cover?.external?.url || page.cover?.file?.url || null,
			summary: page.properties.Summary?.rich_text[0]?.plain_text || '',
			content: mdString.parent,
		}
	} catch (error) {
		console.error('Notion fetch error (slug):', error)
		return null
	}
}
