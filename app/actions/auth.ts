'use server'

import { userQuery } from '@/lib/users-db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { z } from 'zod'

const signupSchema = z
	.object({
		email: z.string().email('Некоректна електронна пошта'),
		password: z.string().min(8, 'Пароль має бути не менше 8 символів'),
		confirmPassword: z.string()
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Паролі не збігаються',
		path: ['confirmPassword']
	})

export async function signup(formData: FormData) {
	const email = formData.get('email') as string
	const password = formData.get('password') as string
	const confirmPassword = formData.get('confirm-password') as string

	const validatedFields = signupSchema.safeParse({
		email,
		password,
		confirmPassword
	})

	if (!validatedFields.success) {
		return {
			error: validatedFields.error.flatten().fieldErrors
		}
	}

	try {
		const existing = await userQuery<any>(
			'SELECT id FROM users WHERE email = ? LIMIT 1',
			[email]
		)

		if (existing.length > 0) {
			return {
				error: { email: ['Користувач з такою електронною поштою вже існує'] }
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10)
		const id = randomUUID()

		await userQuery(
			'INSERT INTO users (id, email, password, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
			[id, email, hashedPassword, 'CLIENT', 1]
		)

		return { success: true }
	} catch (error) {
		console.error('Signup error:', error)
		return {
			error: { form: ['Щось пішло не так. Спробуйте пізніше.'] }
		}
	}
}

const updateProfileSchema = z.object({
	name: z.string().min(2, "Ім'я має бути не менше 2 символів"),
	phone: z.string().optional().nullable(),
	password: z
		.string()
		.min(8, 'Пароль має бути не менше 8 символів')
		.optional()
		.or(z.literal(''))
})

export async function updateProfile(userId: string, formData: FormData) {
	const name = formData.get('name') as string
	const phone = formData.get('phone') as string
	const password = formData.get('password') as string

	const validatedFields = updateProfileSchema.safeParse({
		name,
		phone,
		password
	})

	if (!validatedFields.success) {
		return {
			error: validatedFields.error.flatten().fieldErrors
		}
	}

	try {
		let avatarUrl: string | null = null

		// Handle avatar file upload
		const avatarFile = formData.get('avatar') as File | null
		if (avatarFile && (avatarFile as any).size) {
			const size = (avatarFile as any).size as number
			const type = (avatarFile as any).type as string
			const MAX_BYTES = 2 * 1024 * 1024 // 2MB
			const allowed = ['image/jpeg', 'image/png', 'image/webp']
			if (size > MAX_BYTES) {
				return { error: { avatar: ['Файл завеликий. Максимум 2MB'] } }
			}
			if (type && !allowed.includes(type)) {
				return { error: { avatar: ['Непідтримуваний формат. Використайте JPG, PNG або WEBP'] } }
			}

			try {
				const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
				await fs.mkdir(uploadsDir, { recursive: true })
				const safeName = `${userId}-${Date.now()}-${String(
					(avatarFile as File).name
				).replace(/[^a-z0-9.\-]/gi, '')}`
				const buffer = Buffer.from(await (avatarFile as File).arrayBuffer())
				const filePath = path.join(uploadsDir, safeName)
				await fs.writeFile(filePath, buffer)
				avatarUrl = `/uploads/${safeName}`
			} catch (err) {
				console.error('Avatar upload error:', err)
				return { error: { avatar: ['Не вдалося завантажити файл'] } }
			}
		}

		// Build UPDATE query dynamically
		const fields: string[] = ['name = ?', 'phone = ?', 'updatedAt = NOW()']
		const values: any[] = [name, phone || null]

		if (password && password.length >= 8) {
			fields.push('password = ?')
			values.push(await bcrypt.hash(password, 10))
		}

		if (avatarUrl) {
			fields.push('avatarUrl = ?')
			values.push(avatarUrl)
		}

		values.push(userId)

		await userQuery(
			`UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
			values
		)

		// Fetch updated avatarUrl to return
		const rows = await userQuery<any>(
			'SELECT avatarUrl FROM users WHERE id = ? LIMIT 1',
			[userId]
		)

		return { success: true, avatarUrl: rows[0]?.avatarUrl ?? null }
	} catch (error) {
		console.error('Update profile error:', error)
		return {
			error: { form: ['Не вдалося оновити профіль.'] }
		}
	}
}
