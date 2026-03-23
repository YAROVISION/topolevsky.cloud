'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card'
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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

export function LoginForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setIsLoading(true)

		const formData = new FormData(event.currentTarget)
		const email = formData.get('email') as string
		const password = formData.get('password') as string

		const result = await signIn('credentials', {
			email,
			password,
			redirect: false
		})

		setIsLoading(false)

		if (result?.error) {
			toast.error('Невірна електронна пошта або пароль')
		} else {
			toast.success('Ви успішно увійшли!')
			router.push('/')
			router.refresh()
		}
	}

	return (
		<div
			className={cn('flex flex-col gap-6', className)}
			{...props}
		>
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Ласкаво просимо назад</CardTitle>
					<CardDescription>
						Увійдіть через обліковий запис Google або Facebook
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
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
									Google
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
									Facebook
								</Button>
							</Field>
							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Або продовжити через
							</FieldSeparator>
							<Field>
								<FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="m@example.com"
									required
								/>
							</Field>
							<Field>
								<div className="flex items-center">
									<FieldLabel htmlFor="password">Пароль</FieldLabel>
									<a
										href="#"
										className="ml-auto text-sm underline-offset-4 hover:underline"
									>
										Забули пароль?
									</a>
								</div>
								<Input
									id="password"
									name="password"
									type="password"
									required
								/>
							</Field>
							<Field>
								<Button
									type="submit"
									disabled={isLoading}
								>
									{isLoading ? 'Вхід...' : 'Увійти'}
								</Button>
								<FieldDescription className="text-center">
									Не маєте облікового запису?{' '}
									<Link
										href="/signup"
										className="underline underline-offset-4"
									>
										Зареєструватися
									</Link>
								</FieldDescription>
							</Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
