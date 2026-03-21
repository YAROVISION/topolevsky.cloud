import { userQuery } from '@/lib/users-db'
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

				const rows = await userQuery<any>(
					'SELECT id, email, name, phone, avatarUrl, password FROM users WHERE email = ? LIMIT 1',
					[credentials.email]
				)
				const user = rows[0]

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
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google' || account?.provider === 'apple') {
				try {
					// Перевіряємо, чи є вже такий користувач
					const rows = await userQuery<any>(
						'SELECT id FROM users WHERE email = ? LIMIT 1',
						[user.email]
					)

					if (rows.length === 0) {
						// Створюємо нового користувача
						await userQuery(
							'INSERT INTO users (email, name, avatarUrl) VALUES (?, ?, ?)',
							[user.email, user.name || '', user.image || '']
						)
						console.log(`[Auth] New user created: ${user.email}`)
					} else {
						// Оновлюємо існуючого (наприклад, аватарку)
						await userQuery(
							'UPDATE users SET avatarUrl = ?, name = ? WHERE email = ?',
							[user.image || '', user.name || '', user.email]
						)
						console.log(`[Auth] Existing user updated: ${user.email}`)
					}
				} catch (error) {
					console.error('[Auth] Error in signIn callback:', error)
				}
			}
			return true
		},
		async jwt({ token, user, trigger, session }) {
			if (user) {
				token.id = user.id
				token.phone = (user as any).phone
				token.image = (user as any).image || (user as any).avatarUrl
			}

			// Оновлюємо дані з бази, якщо це необхідно (наприклад, для Google входу)
			if (!token.phone && token.email) {
				const rows = await userQuery<any>(
					'SELECT id, phone, avatarUrl FROM users WHERE email = ? LIMIT 1',
					[token.email]
				)
				const dbUser = rows[0]
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
