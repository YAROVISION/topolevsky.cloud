'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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
		const existingUser = await prisma.user.findUnique({
			where: { email }
		})

		if (existingUser) {
			return {
				error: { email: ['Користувач з такою електронною поштою вже існує'] }
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		await prisma.user.create({
			data: {
				email,
				password: hashedPassword
			}
		})

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
		const updateData: any = {
			name,
			phone
		}

		if (password && password.length >= 8) {
			updateData.password = await bcrypt.hash(password, 10)
		}

		// Handle avatar file upload (save to public/uploads and store URL)
		const avatarFile = formData.get('avatar') as File | null
		if (avatarFile && (avatarFile as any).size) {
			const size = (avatarFile as any).size as number
			const type = (avatarFile as any).type as string
			// Validate size (<= 2MB) and allowed MIME types
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
				updateData.avatarUrl = `/uploads/${safeName}`
			} catch (err) {
				console.error('Avatar upload error:', err)
				return { error: { avatar: ['Не вдалося завантажити файл'] } }
			}
		}

		const updated = await prisma.user.update({
			where: { id: userId },
			data: updateData
		})

		return { success: true, avatarUrl: updated.avatarUrl }
	} catch (error) {
		console.error('Update profile error:', error)
		return {
			error: { form: ['Не вдалося оновити профіль.'] }
		}
	}
}
