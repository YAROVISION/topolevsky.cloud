import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { getPublishedPosts } from '@/lib/notion'
import { BlogPostsClient } from '@/components/blog/blog-posts-client'

export const revalidate = false // Тільки ручне оновлення через API
export const dynamic = 'force-static'

export default async function BlogPage() {
	const posts = await getPublishedPosts()

	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				{/* Hero Section */}
				<section className="pt-40 pb-12 px-4 border-b border-zinc-800/50">
					<div className="max-w-6xl mx-auto text-center">
						<h1
							className="text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tight"
							style={{ fontFamily: 'var(--font-display)' }}
						>
							Блог
						</h1>
						<p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-12">
							Дізнавайтеся першими про новини української лінгвістики, оновлення
							платформи та корисні поради для вивчення мови.
						</p>
					</div>
				</section>

				{/* Blog Posts Logic (Client Side) */}
				<BlogPostsClient initialPosts={posts} />

				<Footer />
			</main>
		</SmoothScroll>
	)
}
