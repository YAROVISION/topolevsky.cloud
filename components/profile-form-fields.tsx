'use client'

import { updateProfile } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Pencil } from 'lucide-react'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ProfileFormFieldsProps {
	session: Session | null
}

export function ProfileFormFields({
	session: initialSession
}: ProfileFormFieldsProps) {
	const router = useRouter()
	const { update } = useSession()
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const [name, setName] = useState(initialSession?.user?.name || '')
	const [phone, setPhone] = useState(initialSession?.user?.phone || '')
	const [password, setPassword] = useState('')
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(
		initialSession?.user?.image ||
			(initialSession?.user as any)?.avatarUrl ||
			null
	)

	const isDirty =
		name !== (initialSession?.user?.name || '') ||
		phone !== (initialSession?.user?.phone || '') ||
		password !== '' ||
		avatarFile !== null

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (!initialSession?.user?.id) return

		setIsLoading(true)
		const formData = new FormData(event.currentTarget)
		const result = await updateProfile(initialSession.user.id, formData)

		if (result.success) {
			await update({
				phone: phone,
				name: name,
				email: initialSession?.user?.email,
				image: result.avatarUrl ?? initialSession?.user?.image
			})

			// Reset avatar file state and preview if uploaded
			if (avatarFile) {
				setAvatarFile(null)
				if (avatarPreview && avatarPreview.startsWith('blob:')) {
					URL.revokeObjectURL(avatarPreview)
				}
				if (result.avatarUrl) {
					setAvatarPreview(result.avatarUrl)
				}
			}
			setPassword('') // Скидаємо поле пароля після успішного оновлення
			router.refresh()
			toast.success('Профіль успішно оновлено')
		} else if (result.error) {
			const errors = result.error as any
			if (errors.avatar) toast.error(errors.avatar[0])
			else if (errors.name) toast.error(errors.name[0])
			else if (errors.email) toast.error(errors.email[0])
			else if (errors.form) toast.error(errors.form[0])
			else toast.error('Помилка при оновленні профілю')
		}

		setIsLoading(false)
	}

	return (
		<form onSubmit={handleSubmit}>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="name">Ім'я</FieldLabel>
					<Input
						id="name"
						name="name"
						type="text"
						value={name}
						onChange={e => setName(e.target.value)}
						placeholder="Ваше ім'я"
						required
					/>
				</Field>
				<Field>
					<FieldLabel
						htmlFor="avatar"
						className="flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors"
					>
						Фото профілю <Pencil className="size-3.5" />
					</FieldLabel>
					<div className="relative">
						<Input
							id="avatar-display"
							type="text"
							placeholder="Файл не обрано"
							value={avatarFile ? avatarFile.name : ''}
							readOnly
							className="cursor-pointer"
							onClick={() => document.getElementById('avatar')?.click()}
						/>
						<input
							id="avatar"
							name="avatar"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={e => {
								const file = e.target.files ? e.target.files[0] : null
								if (file) {
									// Client-side validation: size <= 2MB, type jpeg/png/webp
									const MAX_BYTES = 2 * 1024 * 1024
									const allowed = ['image/jpeg', 'image/png', 'image/webp']
									if (file.size > MAX_BYTES) {
										toast.error('Файл завеликий. Максимум 2MB')
										return
									}
									if (file.type && !allowed.includes(file.type)) {
										toast.error(
											'Непідтримуваний формат. Використайте JPG, PNG або WEBP'
										)
										return
									}
									if (avatarPreview && avatarPreview.startsWith('blob:')) {
										URL.revokeObjectURL(avatarPreview)
									}
									setAvatarFile(file)
									setAvatarPreview(URL.createObjectURL(file))
								}
							}}
						/>
					</div>
				</Field>
				<Field>
					<FieldLabel htmlFor="phone">Номер телефону</FieldLabel>
					<Input
						id="phone"
						name="phone"
						type="tel"
						value={phone}
						onChange={e => setPhone(e.target.value)}
						placeholder="+380 (__) ___-__-__"
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
					<Input
						id="email"
						name="email"
						type="email"
						value={initialSession?.user?.email || ''}
						readOnly
						className="opacity-50 cursor-not-allowed bg-muted"
						placeholder="m@example.com"
						required
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="password">Пароль</FieldLabel>
					<div className="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="pr-10"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					</div>
				</Field>
				<Field className="flex flex-row gap-3">
					<Button
						type="submit"
						className={cn(
							'flex-1 transition-all',
							!isDirty && 'opacity-50 cursor-not-allowed grayscale'
						)}
						disabled={!isDirty || isLoading}
					>
						{isLoading ? 'Збереження...' : 'Зберегти'}
					</Button>
					<Button
						variant="outline"
						className="flex-1"
						asChild
					>
						<Link href="/">Вийти</Link>
					</Button>
				</Field>
			</FieldGroup>
		</form>
	)
}
