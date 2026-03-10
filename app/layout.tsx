import { Providers } from '@/components/providers'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import localFont from 'next/font/local'
import type React from 'react'
import { Toaster } from 'sonner'
import './globals.css'

const manrope = Manrope({
	subsets: ['latin'],
	variable: '--font-manrope'
})

const calSans = localFont({
	src: './fonts/CalSans-SemiBold.woff2',
	variable: '--font-cal-sans',
	display: 'swap'
})

const instrumentSans = localFont({
	src: './fonts/InstrumentSans-Variable.woff2',
	variable: '--font-instrument-sans',
	display: 'swap'
})

export const metadata: Metadata = {
	title: 'Lexis',
	description: 'Логіка української мови',
	generator: 'v0.app',
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: 'any' },
			{ url: '/favicon.svg', type: 'image/svg+xml' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
		],
		apple: [
			{ url: '/favicon-180x180.png', sizes: '180x180', type: 'image/png' }
		]
	}
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html
			lang="uk"
			className="dark"
		>
			<body
				className={`${manrope.variable} ${calSans.variable} ${instrumentSans.variable} font-sans antialiased`}
			>
				<Providers>
					<div
						className="noise-overlay"
						aria-hidden="true"
					/>
					{children}
					<Toaster />
					<Analytics />
				</Providers>
			</body>
		</html>
	)
}
