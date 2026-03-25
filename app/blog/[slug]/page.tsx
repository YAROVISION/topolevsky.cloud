// VERSION 1.0.1 - FIXED ASYNC PARAMS & IMPORTS
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'
import { getPostBySlug, getPublishedPosts } from '@/lib/notion'
import { Calendar, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600 // ISR

interface Props {
	params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
	const params = await props.params
	const post = await getPostBySlug(params.slug)
	
	if (!post) return { title: 'Post Not Found' }

	return {
		title: `${post.title} | Lexis Blog`,
		description: post.summary,
		openGraph: {
			images: post.image ? [post.image] : [],
		},
	}
}

export async function generateStaticParams() {
	const posts = await getPublishedPosts()
	return posts.map((post) => ({
		slug: post.slug,
	}))
}

export default async function PostPage(props: Props) {
	const params = await props.params
	const post = await getPostBySlug(params.slug)

	if (!post) {
		notFound()
	}

	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<article className="pt-32 pb-20 px-4">
					<div className="max-w-3xl mx-auto">
						{/* Back Link */}
						<Link
							href="/blog"
							className="inline-flex items-center text-zinc-500 hover:text-white mb-12 transition-colors text-sm group"
						>
							<ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
							Назад до блогу
						</Link>

						{/* Header */}
						<header className="mb-12">
							<div className="flex items-center gap-3 mb-6">
								<span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
									{post.category}
								</span>
								<div className="flex items-center gap-4 text-zinc-500 text-[11px]">
									<div className="flex items-center gap-1">
										<Calendar className="w-3 h-3" />
										{new Date(post.date).toLocaleDateString('uk-UA', {
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										})}
									</div>
									<div className="flex items-center gap-1">
										<Clock className="w-3 h-3" />5 хв
									</div>
								</div>
							</div>

							<h1
								className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight"
								style={{ fontFamily: 'var(--font-display)' }}
							>
								{post.title}
							</h1>

							{post.image && (
								<div className="relative aspect-video rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 mb-12">
									<img
										src={post.image}
										alt={post.title}
										className="w-full h-full object-cover opacity-90"
									/>
								</div>
							)}
						</header>

						{/* Content */}
						<div className="prose prose-invert prose-emerald max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-a:text-emerald-400 prose-code:text-emerald-300 prose-pre:bg-zinc-900/50 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-2xl">
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{post.content || ''}
							</ReactMarkdown>
						</div>
					</div>
				</article>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
