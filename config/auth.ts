import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { AuthOptions } from 'next-auth'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
export const authConfig: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		}),
		AppleProvider({
			clientId: process.env.APPLE_ID!,
			clientSecret: process.env.APPLE_SECRET!
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email }
				})

				if (!user || !user.password) {
					return null
				}

				const isPasswordValid = await bcrypt.compare(
					credentials.password,
					user.password
				)

				if (!isPasswordValid) {
					return null
				}

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					phone: user.phone,
					image: user.avatarUrl
				}
			}
		})
	],
	session: {
		strategy: 'jwt'
	},
	pages: {
		signIn: '/login'
	},
	callbacks: {
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id
				token.phone = (user as any).phone
				token.image = (user as any).image || (user as any).avatarUrl
			}

			// Оновлюємо дані з бази, якщо це необхідно (наприклад, для Google входу)
			if (!token.phone && token.email) {
				const dbUser = await prisma.user.findUnique({
					where: { email: token.email },
					select: { phone: true, id: true, avatarUrl: true }
				})
				if (dbUser) {
					token.id = dbUser.id
					token.phone = dbUser.phone
					if (dbUser.avatarUrl) token.image = dbUser.avatarUrl
				}
			}

			if (trigger === 'update' && session) {
				if (session.phone) token.phone = session.phone
				if (session.name) token.name = session.name
				if (session.email) token.email = session.email
				if (session.image) token.image = session.image
			}

			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.phone = token.phone as string | null
				session.user.image = token.image as string | null
			}
			return session
		}
	}
}
