import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader
} from '@/components/ui/card'
import { FieldDescription } from '@/components/ui/field'
import { authConfig } from '@/config/auth'
import { cn } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { ProfileFormFields } from './profile-form-fields'

export async function ProfileForm({
	className,
	...props
}: React.ComponentProps<'div'>) {
	const session = await getServerSession(authConfig)

	return (
		<div
			className={cn('flex flex-col gap-6', className)}
			{...props}
		>
			<Card>
				<CardHeader className="items-center pb-2 text-center">
					<div className="flex justify-center py-4">
						<Avatar className="size-24 border-4 border-background shadow-lg">
							<AvatarImage
								src={session?.user?.image || 'https://github.com/shadcn.png'}
								alt={session?.user?.name || '@shadcn'}
							/>
							<AvatarFallback>
								{session?.user?.name?.substring(0, 2).toUpperCase() || 'CN'}
							</AvatarFallback>
						</Avatar>
					</div>
					<CardDescription className="text-emerald-400 text-2xl font-bold">
						{session?.user?.name || 'Гість'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ProfileFormFields session={session} />
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				Вносячи зміни, ви погоджуєтесь з нашими{' '}
				<a href="#">Умовами використання</a>.
			</FieldDescription>
		</div>
	)
}
