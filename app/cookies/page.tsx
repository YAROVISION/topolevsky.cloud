import { Footer } from '@/components/footer'
import { Navbar } from '@/components/navbar'
import { SmoothScroll } from '@/components/smooth-scroll'

export default function CookiesPage() {
	return (
		<SmoothScroll>
			<main className="min-h-screen bg-black">
				<Navbar />

				<section className="pt-28 pb-20 px-4">
					<div className="max-w-3xl mx-auto text-zinc-300">
						<h1 className="text-3xl font-bold text-white mb-4">
							Політика використання файлів cookie
						</h1>
						<p className="text-zinc-400 mb-2">
							Дата останнього оновлення: 10 березня 2026 року
						</p>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								1. Що таке файли cookie?
							</h2>
							<p className="text-zinc-400">
								Файли cookie — це невеликі текстові файли, які зберігаються на
								вашому пристрої (комп'ютері, смартфоні або планшеті) під час
								відвідування нашого сайту. Вони допомагають сайту
								запам'ятовувати ваші дії та налаштування протягом певного часу,
								щоб вам не доводилося вводити їх знову при кожному відвідуванні.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								2. Які файли cookie ми використовуємо?
							</h2>

							<h3 className="text-lg font-semibold text-white mt-4">
								🔒 Необхідні файли cookie
							</h3>
							<p className="text-zinc-400">
								Ці файли cookie є обов'язковими для коректної роботи сайту. Без
								них деякі функції будуть недоступні. Вони не потребують вашої
								згоди згідно зі статтею 6(1)(f) GDPR.
							</p>
							<ul className="mt-2 text-zinc-400 list-disc pl-5">
								<li>
									<strong>session_id</strong> — Підтримка сесії користувача — До
									закриття браузера
								</li>
								<li>
									<strong>csrf_token</strong> — Захист від міжсайтових атак — До
									закриття браузера
								</li>
								<li>
									<strong>cookie_consent</strong> — Збереження ваших налаштувань
									cookie — 12 місяців
								</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mt-4">
								📊 Аналітичні файли cookie
							</h3>
							<p className="text-zinc-400">
								Ці файли cookie допомагають нам розуміти, як відвідувачі
								взаємодіють із сайтом. Усі дані збираються анонімно.
								Використовуються лише за вашою згодою.
							</p>
							<ul className="mt-2 text-zinc-400 list-disc pl-5">
								<li>
									<strong>_ga</strong> — Google Analytics — Розрізнення
									користувачів — 2 роки
								</li>
								<li>
									<strong>_gid</strong> — Google Analytics — Відстеження сесій —
									24 години
								</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mt-4">
								⚙️ Функціональні файли cookie
							</h3>
							<p className="text-zinc-400">
								Ці файли cookie запам'ятовують ваші вподобання та налаштування
								для покращення досвіду використання. Використовуються лише за
								вашою згодою.
							</p>
							<ul className="mt-2 text-zinc-400 list-disc pl-5">
								<li>
									<strong>lang_pref</strong> — Збереження обраної мови — 12
									місяців
								</li>
								<li>
									<strong>theme</strong> — Збереження теми оформлення — 6
									місяців
								</li>
							</ul>

							<h3 className="text-lg font-semibold text-white mt-4">
								📢 Маркетингові файли cookie
							</h3>
							<p className="text-zinc-400">
								Ці файли cookie використовуються для показу релевантної реклами.
								Використовуються лише за вашою явною згодою.
							</p>
							<ul className="mt-2 text-zinc-400 list-disc pl-5">
								<li>
									<strong>_fbp</strong> — Meta (Facebook) — Відстеження
									конверсій — 3 місяці
								</li>
								<li>
									<strong>IDE</strong> — Google Ads — Персоналізована реклама —
									13 місяців
								</li>
							</ul>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								3. Файли cookie третіх сторін
							</h2>
							<p className="text-zinc-400">
								Деякі файли cookie встановлюються третіми сторонами, зокрема:
							</p>
							<ul className="text-zinc-400 list-disc pl-5">
								<li>
									Google LLC — аналітика та реклама. Політика конфіденційності:{' '}
									<a
										href="https://policies.google.com"
										className="text-emerald-400"
									>
										policies.google.com
									</a>
								</li>
								<li>
									Meta Platforms Ireland Ltd — маркетинг. Політика
									конфіденційності:{' '}
									<a
										href="https://www.facebook.com/privacy"
										className="text-emerald-400"
									>
										facebook.com/privacy
									</a>
								</li>
							</ul>
							<p className="text-zinc-400 mt-2">
								Ми не контролюємо файли cookie третіх сторін. Рекомендуємо
								ознайомитися з їхніми політиками конфіденційності.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								4. Ваша згода та права (GDPR)
							</h2>
							<p className="text-zinc-400">
								Відповідно до Загального регламенту про захист даних (GDPR) та
								Директиви про ePrivacy, ми запитуємо вашу згоду перед
								встановленням будь-яких необов'язкових файлів cookie.
							</p>
							<ul className="text-zinc-400 list-disc pl-5 mt-2">
								<li>
									Надати згоду — натиснувши «Прийняти всі» на банері cookie
								</li>
								<li>Відмовитись — натиснувши «Відхилити необов'язкові»</li>
								<li>Обрати вибірково — через «Налаштування cookie»</li>
								<li>
									Відкликати згоду в будь-який момент, змінивши налаштування
									нижче
								</li>
							</ul>
							<p className="mt-2 text-emerald-400">
								👉 Змінити налаштування cookie
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								5. Як керувати файлами cookie через браузер?
							</h2>
							<p className="text-zinc-400">
								Ви також можете видалити або заблокувати файли cookie
								безпосередньо в налаштуваннях вашого браузера:
							</p>
							<ul className="text-zinc-400 list-disc pl-5 mt-2">
								<li>
									Google Chrome: Налаштування → Конфіденційність і безпека →
									Файли cookie
								</li>
								<li>
									Mozilla Firefox: Налаштування → Конфіденційність і захист
								</li>
								<li>Safari: Параметри → Приватність</li>
								<li>
									Microsoft Edge: Налаштування → Конфіденційність, пошук та
									служби
								</li>
							</ul>
							<p className="text-zinc-400 mt-2">
								⚠️ Зверніть увагу: вимкнення необхідних файлів cookie може
								порушити роботу сайту.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								6. Передача даних за межі ЄС
							</h2>
							<p className="text-zinc-400">
								Деякі постачальники (зокрема Google та Meta) можуть обробляти
								дані за межами Європейського Союзу. Така передача здійснюється
								відповідно до стандартних договірних положень (SCCs),
								затверджених Європейською комісією.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								7. Зміни до цієї політики
							</h2>
							<p className="text-zinc-400">
								Ми можемо оновлювати цю політику відповідно до змін у
								законодавстві або нашої практики. Про суттєві зміни ми
								повідомимо через банер на сайті. Дата оновлення завжди вказана
								вгорі сторінки.
							</p>
						</section>

						<section className="mb-6">
							<h2 className="text-xl font-semibold text-white mb-2">
								8. Контакти
							</h2>
							<p className="text-zinc-400">
								З питань щодо використання файлів cookie або реалізації ваших
								прав звертайтесь:
								<br />
								[Назва компанії]
								<br />
								<a
									href="mailto:privacy@вашсайт.com"
									className="text-emerald-400"
								>
									privacy@вашсайт.com
								</a>
								<br />
								[Юридична адреса]
							</p>
							<p className="text-zinc-400 mt-2">
								Якщо ви вважаєте, що ваші права порушено, ви маєте право подати
								скаргу до наглядового органу з захисту даних у вашій країні.
							</p>
						</section>

						<p className="text-xs text-zinc-500">
							Ця політика відповідає вимогам Регламенту (ЄС) 2016/679 (GDPR) та
							Директиви 2002/58/ЄС (ePrivacy Directive).
						</p>
					</div>
				</section>

				<Footer />
			</main>
		</SmoothScroll>
	)
}
