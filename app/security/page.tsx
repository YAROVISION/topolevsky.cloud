import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function SecurityPage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto text-zinc-300">
						<h1 className="text-3xl font-bold text-white mb-4">Безпека</h1>
						<p className="mb-6 text-zinc-400">
							Ми серйозно ставимося до безпеки платформи та ваших даних. Нижче
							наведено основні підходи й практики, які ми застосовуємо для
							захисту інформації.
						</p>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Захист даних
							</h2>
							<p className="text-zinc-400">
								Персональні та операційні дані зберігаються з використанням
								сучасних стандартів шифрування як під час передачі (TLS), так і
								в стані зберігання, коли це необхідно. Доступ до чутливих даних
								обмежений та контрольований.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Контроль доступу
							</h2>
							<p className="text-zinc-400">
								Ми застосовуємо принцип найменших привілеїв: співробітники та
								сервіси мають доступ лише до тих ресурсів, які необхідні для
								їхніх завдань. Аутентифікація користувачів підтримує сучасні
								механізми (наприклад, багатофакторну аутентифікацію, коли
								доступно).
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Оновлення та управління вразливостями
							</h2>
							<p className="text-zinc-400">
								Ми регулярно застосовуємо оновлення безпеки для програмного
								забезпечення та залежностей. Працюємо з відомими постачальниками
								для швидкого виправлення вразливостей та проводимо періодичні
								перевірки безпеки.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Моніторинг та реагування на інциденти
							</h2>
							<p className="text-zinc-400">
								Ми моніторимо системи на предмет підозрілої активності і маємо
								процедури для реагування на інциденти безпеки, включно з
								оповіщенням користувачів і відповідними правовими діями, якщо це
								потрібно.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Зовнішні постачальники та інтеграції
							</h2>
							<p className="text-zinc-400">
								Ми обираємо постачальників згідно з їхніми стандартами безпеки,
								підписуємо необхідні угоди про обробку даних і мінімізуємо обсяг
								даних, що передаються третім сторонам.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Cookies та автоматизований збір даних
							</h2>
							<p className="text-zinc-400">
								Ми використовуємо файли cookie для коректної роботи сервісу та
								аналітики. Автоматичний збір даних (скрейпінг, парсинг)
								заборонено відповідно до умов використання; у випадку виявлення
								ми можемо вживати технічних та юридичних заходів.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								Як повідомити про проблему
							</h2>
							<p className="text-zinc-400">
								Якщо ви виявили вразливість чи проблему безпеки, будь ласка,
								повідомте нас на{' '}
								<a
									href="mailto:security@example.com"
									className="text-emerald-400"
								>
									security@example.com
								</a>
								. Ми цінуємо відповідальне розкриття і оперативно розглянемо ваш
								запит.
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
