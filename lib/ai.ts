import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export interface AIRelation {
	word: string
	level: number
}

export interface AICategorization {
	level: number
	hypernyms: AIRelation[]
	hyponyms: AIRelation[]
}

export async function categorizeWord(
	word: string
): Promise<AICategorization | null> {
	if (!process.env.GOOGLE_AI_API_KEY) {
		console.error('GOOGLE_AI_API_KEY is not set')
		return null
	}

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

		const prompt = `Визнач рівень абстракції для слова "${word}" за шкалою від 1 до 10, використовуючи наступні визначення категорій:

1. Філософські поняття: Максимально абстрактні поняття, неможливо побачити або доторкнутися (наприклад: буття, сутність, істина, добро, час).
2. Емоції та якості: Внутрішні стани, почуття, якості характеру (наприклад: любов, щастя, справедливість, мудрість, краса).
3. Процеси та дії: Дії як абстрактні поняття, процеси (наприклад: розвиток, рух, зростання, навчання, мислення).
4. Соціальні та культурні концепти: Суспільні інститути, відносини, культурні явища (наприклад: демократія, освіта, культура, релігія, політика).
5. Наукові поняття: Терміни з різних галузей знань (наприклад: гравітація, енергія, еволюція, інформація, алгоритм).
6. Вимірювані абстракції: Можна виміряти, але не можна побачити (наприклад: температура, швидкість, вага, відстань, вартість).
7. Групові поняття: Збірні іменники, категорії об'єктів (наприклад: меблі, одяг, транспорт, посуд, інструменти, тварини).
8. Загальні класи об'єктів: Узагальнені назви предметів з фізичною формою (наприклад: будинок, дерево, машина, книга, стілець, їжа).
9. Конкретні об'єкти: Специфічні види об'єктів (наприклад: дуб, собака, кіт, яблуко, помідор, автомобіль, велосипед).
10. Максимально конкретні: Власні назви, унікальні об'єкти (наприклад: Київ, Дніпро, Україна, iPhone, Mercedes, Кобзар).

Також визнач список гіпернімів (більш загальних понять) та гіпонімів (більш конкретних понять) для цього слова. Для кожного знайденого слова також вкажи його рівень абстракції (від 1 до 10).

Відповідь надай ТІЛЬКИ у форматі JSON:
{
  "level": число від 1 до 10,
  "hypernyms": [{"word": "слово1", "level": 7}, {"word": "слово2", "level": 8}],
  "hyponyms": [{"word": "слово1", "level": 10}]
}`

		const result = await model.generateContent(prompt)
		const response = await result.response
		const text = response
			.text()
			.trim()
			.replace(/```json|```/g, '')

		try {
			const data = JSON.parse(text)
			if (
				typeof data.level === 'number' &&
				data.level >= 1 &&
				data.level <= 10
			) {
				return {
					level: data.level,
					hypernyms: Array.isArray(data.hypernyms) ? data.hypernyms : [],
					hyponyms: Array.isArray(data.hyponyms) ? data.hyponyms : []
				}
			}
		} catch (e) {
			console.error('Failed to parse AI response as JSON:', text)
		}

		return null
	} catch (error) {
		console.error('Error in categorizeWord:', error)
		return null
	}
}
