import { DefaultSession } from 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
	interface Session {
		user: {
			id: string
			phone?: string | null
			avatarUrl?: string | null
			role: string
			subscriptionTier: string
		} & DefaultSession['user']
	}

	interface User {
		id: string
		phone?: string | null
		avatarUrl?: string | null
		role: string
		subscriptionTier: string
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		id: string
		phone?: string | null
		avatarUrl?: string | null
		role: string
		subscriptionTier: string
	}
}
