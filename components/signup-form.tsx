'use client'

import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function SignupForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsLoading(true)

		const formData = new FormData(event.currentTarget)
		const result = await signup(formData)

		setIsLoading(false)

		if (result.error) {
			const errors = result.error as any
			if (errors.email) toast.error(errors.email[0])
			else if (errors.password) toast.error(errors.password[0])
			else if (errors.confirmPassword) toast.error(errors.confirmPassword[0])
			else if (errors.form) toast.error(errors.form[0])
			else toast.error('Сталася помилка при реєстрації')
		} else {
			toast.success('Обліковий запис створено! Тепер ви можете увійти.')
			router.push('/login')
		}
	}

	return (
		<div
			className={cn('flex flex-col gap-6', className)}
			{...props}
		>
			<Card className="overflow-hidden p-0">
				<CardContent className="p-0">
					<form
						className="p-6 md:p-8"
						onSubmit={handleSubmit}
					>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Створити обліковий запис</h1>
								<p className="text-muted-foreground text-sm text-balance">
									Введіть свою електронну пошту нижче, щоб створити обліковий
									запис
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
								<FieldDescription>
									Ми використаємо це для зв&apos;язку з вами. Ми не
									передаватимемо вашу електронну пошту іншим особам.
								</FieldDescription>
							</Field>
							<div className="flex flex-col gap-4">
								<Field>
									<FieldLabel htmlFor="password">Пароль</FieldLabel>
									<Input
										id="password"
										name="password"
										type="password"
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="confirm-password">
										Підтвердьте пароль
									</FieldLabel>
									<Input
										id="confirm-password"
										name="confirm-password"
										type="password"
										required
									/>
								</Field>
								<FieldDescription>
									Має бути не менше 8 символів.
								</FieldDescription>
							</div>
							<Field>
								<Button
									type="submit"
									disabled={isLoading}
								>
									{isLoading ? 'Створення...' : 'Створити обліковий запис'}
								</Button>
							</Field>
							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Або продовжити за допомогою
							</FieldSeparator>
							<Field className="grid grid-cols-2 gap-4">
								<Button
									variant="outline"
									type="button"
									onClick={() => signIn('google', { callbackUrl: '/' })}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
									>
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									<span className="sr-only">
										Зареєструватися за допомогою Google
									</span>
								</Button>
								<Button
									variant="outline"
									type="button"
									onClick={() => signIn('facebook', { callbackUrl: '/' })}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
									>
										<path
											d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"
											fill="currentColor"
										/>
									</svg>
									<span className="sr-only">
										Зареєструватися за допомогою Facebook
									</span>
								</Button>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				Вносячи зміни, ви погоджуєтесь з нашими{' '}
				<a href="#">Умовами використання</a>.
			</FieldDescription>
		</div>
	)
}
