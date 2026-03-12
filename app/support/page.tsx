import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function SupportPage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto text-zinc-300">
						<h1 className="text-3xl font-bold text-white mb-6">Підтримка</h1>
						
						<p className="mb-6 text-zinc-400 text-lg leading-relaxed">
							Платформа Lexis — це проект, створений для допомоги у роботі з українською мовою, 
							її логічного аналізу та систематизації знань. Ми постійно працюємо над 
							вдосконаленням наших алгоритмів та бази даних.
						</p>

						<section className="mb-10 bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
							<h2 className="text-2xl font-semibold text-white mb-4">
								Допоможіть нам стати кращими
							</h2>
							<p className="text-zinc-400 mb-6 font-medium">
								Якщо вам подобається те, що ми робимо, ви можете допомогти проекту розвиватися. 
								Ваша підтримка може бути різною:
							</p>
							
							<ul className="space-y-4 text-zinc-400">
								<li className="flex gap-3">
									<span className="text-emerald-500 font-bold">•</span>
									<span>
										<strong>Зворотний зв'язок:</strong> Повідомляйте про помилки або діліться ідеями через сторінку контактів.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-emerald-500 font-bold">•</span>
									<span>
										<strong>Контент:</strong> Допоможіть нам розширювати базу даних слів та їхніх значень.
									</span>
								</li>
								<li className="flex gap-3">
									<span className="text-emerald-500 font-bold">•</span>
									<span>
										<strong>Спільнота:</strong> Розповідайте про Lexis своїм друзям та колегам.
									</span>
								</li>
							</ul>

							<div className="mt-8">
								<a 
									href="/contact"
									className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-700 disabled:pointer-events-none disabled:opacity-50"
								>
									Зв'язатися з нами
								</a>
							</div>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Чому це важливо?
							</h2>
							<p className="text-zinc-400">
								Розвиток відкритих лінгвістичних інструментів сприяє збереженню та популяризації 
								культурної спадщини. Завдяки вашій допомозі ми зможемо додати більше 
								функцій, покращити точність аналізу та зробити сервіс ще кориснішим для науковців, 
								студентів та всіх, хто цінує українське слово.
							</p>
						</section>

						<p className="text-xs text-zinc-500 mt-12">
							Останнє оновлення: 12 березня 2026 р.
						</p>
					</div>
				</section>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
