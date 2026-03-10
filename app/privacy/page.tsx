import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function PrivacyPage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />
				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto text-zinc-300">
						<h1 className="text-3xl font-bold text-white mb-4">
							Політика конфіденційності
						</h1>
						<p className="mb-6">
							Ця політика описує, які дані ми збираємо, як їх використовуємо та
							які у вас є права щодо особистої інформації.
						</p>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								1. Інформація, яку ми збираємо
							</h2>
							<ul className="list-disc pl-5 text-zinc-400">
								<li>
									Дані, які ви надаєте безпосередньо (наприклад, ім'я,
									електронна пошта при реєстрації).
								</li>
								<li>
									Дані про використання сервісу (журнали, налаштування,
									аналітика анонімізована).
								</li>
								<li>
									Файли cookie та подібні технології для покращення роботи
									сайту.
								</li>
							</ul>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								2. Як ми використовуємо інформацію
							</h2>
							<p className="text-zinc-400">
								Ми використовуємо дані для надання послуг, поліпшення продукту,
								безпеки, сповіщень та дотримання юридичних вимог.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								3. Передача третім особам
							</h2>
							<p className="text-zinc-400">
								Ми не продаємо вашу особисту інформацію. Можливо, ми передаємо
								дані постачальникам послуг, які працюють від нашого імені, або у
								випадку правових запитів.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								4. Cookies
							</h2>
							<p className="text-zinc-400">
								Ми використовуємо файли cookie для збереження сесій, налаштувань
								та аналітики. Ви можете керувати cookie через налаштування
								браузера.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								5. Ваші права
							</h2>
							<p className="text-zinc-400">
								Ви маєте право запитувати доступ до своїх даних, їх виправлення
								або видалення. Для цього зверніться на нашу пошту
								support@example.com.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								6. Зберігання та безпека
							</h2>
							<p className="text-zinc-400">
								Ми використовуємо технології й організаційні заходи для захисту
								даних, але жодна система не може гарантувати повну безпеку.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								7. Контакти
							</h2>
							<p className="text-zinc-400">
								Якщо у вас є питання щодо цієї політики, пишіть на
								support@example.com.
							</p>
						</section>

						<p className="text-xs text-zinc-500">
							Останнє оновлення: 10 березня 2026 р.
						</p>
					</div>
				</section>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
