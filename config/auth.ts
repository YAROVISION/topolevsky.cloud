import { userQuery } from '@/lib/users-db'
import bcrypt from 'bcryptjs'
import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

export const authConfig: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		}),
		FacebookProvider({
			clientId: process.env.FACEBOOK_APP_ID!,
			clientSecret: process.env.FACEBOOK_APP_SECRET!,
			authorization: {
				params: {
					scope: 'email,public_profile'
				}
			}
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
					'SELECT id, email, name, phone, avatarUrl, password, role, subscriptionTier FROM users WHERE email = ? LIMIT 1',
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
					image: user.avatarUrl,
					role: user.role,
					subscriptionTier: user.subscriptionTier
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
			if (account?.provider === 'google' || account?.provider === 'facebook') {
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
		async jwt({ token, user, trigger, session, account, profile }) {
			try {
				if (account?.provider === 'facebook' && profile) {
					token.image = `https://graph.facebook.com/${(profile as any).id || (profile as any).sub}/picture?type=large`
				}

				if (user) {
					token.id = user.id
					token.phone = (user as any).phone
					token.image = (user as any).image || (user as any).avatarUrl
					token.role = (user as any).role || 'CLIENT'
					token.subscriptionTier = (user as any).subscriptionTier || 'FREE'
					console.log(`[Auth] JWT Init for ${token.email}: role=${token.role}`)
				}

				// Оновлюємо дані з бази, якщо це необхідно
				if (token.email) {
					const rows = await userQuery<any>(
						'SELECT id, phone, avatarUrl, role, subscriptionTier FROM users WHERE email = ? LIMIT 1',
						[token.email]
					)
					const dbUser = rows[0]
					if (dbUser) {
						token.id = dbUser.id
						token.phone = dbUser.phone
						token.role = dbUser.role || 'CLIENT'
						token.subscriptionTier = dbUser.subscriptionTier || 'FREE'
						if (dbUser.avatarUrl) token.image = dbUser.avatarUrl
						console.log(`[Auth] JWT Refresh from DB for ${token.email}: role=${token.role}`)
					}
				}

				if (trigger === 'update' && session) {
					if (session.phone) token.phone = session.phone
					if (session.name) token.name = session.name
					if (session.email) token.email = session.email
					if (session.image) token.image = session.image
				}
			} catch (error) {
				console.error('[Auth] Error in jwt callback:', error)
			}

			return token
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.phone = token.phone as string | null
				session.user.image = token.image as string | null
				session.user.role = token.role as string
				session.user.subscriptionTier = token.subscriptionTier as string
			}
			return session
		}
	}
}
