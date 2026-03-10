import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function LicensePage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto text-zinc-300">
						<h1 className="text-3xl font-bold text-white mb-4">Ліцензія</h1>
						<p className="mb-6">
							Нижче наведено стандартний текст ліцензії (MIT). Замініть рік та
							власника на фактичні дані вашого проєкту або вставте іншу ліцензію
							за потреби.
						</p>

						<section className="mb-6 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800 text-sm text-zinc-300">
							<h2 className="text-xl font-semibold text-white mb-3">
								MIT License (приклад)
							</h2>
							<pre className="whitespace-pre-wrap text-zinc-300 text-sm">
								{`© 2026 Lexis, Inc. Всі права захищено.

Увесь вміст цього сайту, включно з, але не обмежуючись:
текстами, зображеннями, графікою, дизайном, програмним кодом,
базами даних, алгоритмами та структурою сайту — є власністю
Lexis, Inc. і захищений законодавством України про авторське
право та міжнародними угодами про інтелектуальну власність.

Забороняється без письмового дозволу Lexis, Inc.:
— копіювати, відтворювати або розповсюджувати будь-які матеріали;
— використовувати матеріали в комерційних цілях;
— змінювати, адаптувати або створювати похідні роботи;
— здійснювати реверс-інжиніринг програмного забезпечення;
— копіювати або використовувати структуру бази даних;
— автоматично збирати дані з сайту (парсинг, скрейпінг).

Порушення цих умов може призвести до цивільної або
кримінальної відповідальності відповідно до чинного
законодавства України.`}
							</pre>
						</section>

						<section className="mb-6">
							<h3 className="text-lg font-semibold text-white mb-2">
								Коротке пояснення
							</h3>
							<p className="text-zinc-400">
								MIT — це відкрита та дуже проста ліцензія: вона дозволяє іншим
								використовувати, змінювати і поширювати код, включно з
								комерційним використанням, за умови збереження повідомлення про
								авторські права та тези ліцензії у копіях.
							</p>
						</section>

						<section className="mb-6">
							<h3 className="text-lg font-semibold text-white mb-2">
								Як змінити
							</h3>
							<ol className="list-decimal pl-5 text-zinc-400">
								<li>
									Змініть рік і ім'я власника в блоці копірайту (замість "2026
									Lexis, Inc.").
								</li>
								<li>
									Якщо ви використовуєте іншу ліцензію (Apache, GPL тощо),
									замініть текст на відповідний.
								</li>
								<li>
									Покладіть файл ліцензії в корінь репозиторію, наприклад
									`LICENSE`.
								</li>
							</ol>
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
