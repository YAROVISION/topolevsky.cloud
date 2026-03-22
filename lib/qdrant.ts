import { QdrantClient } from '@qdrant/js-client-rest'

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://qdrant.lexis.blog',
  apiKey: process.env.QDRANT_API_KEY,
  port: 443,
  checkCompatibility: false
})

export const COLLECTION_NAME = 'kcs_decisions'

/**
 * Визначає категорію за номером справи
 */
export function detectCategory(caseNumber: string): string {
  if (!caseNumber) return 'unknown'
  const clean = caseNumber.toLowerCase().trim()
  
  // 1. Прямі суфікси (найнадійніші)
  if (clean.endsWith('-а') || clean.includes('/а-') || clean.includes(' 2-а')) return 'administrative'
  if (clean.endsWith('-к') || clean.startsWith('1-')) return 'criminal'
  if (clean.endsWith('-ц') || clean.startsWith('2-')) return 'civil'

  // 2. Коди судів (перші цифри до першої скісної /)
  const prefix = clean.split('/')[0]
  
  // Типові коди окружних адміністративних судів
  const adminCodes = [
    '120', '140', '160', '200', '240', '280', '320', '380', '400', '420', 
    '440', '460', '480', '500', '520', '540', '560', '580', '600', '620', 
    '640', '801', '802', '803', '804', '805', '806', '807', '808', '809', 
    '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', 
    '820', '821', '822', '823', '824', '825', '826', '990', '991', '1570', '2602'
  ]
  
  if (adminCodes.includes(prefix)) return 'administrative'
  
  // За замовчуванням для цієї колекції вважаємо кримінальним
  return 'criminal'
}

// Ініціалізація колекції (викликати один раз)
export async function initCollection() {
  const { PROVIDERS, getActiveProvider } = require('./embeddings')
  const provider = getActiveProvider()
  const vectorSize = PROVIDERS[provider].size

  const collections = await qdrant.getCollections()
  const existing = collections.collections.find(c => c.name === COLLECTION_NAME)

  if (existing) {
    // Перевіряємо, чи збігається розмір вектора
    const info = await qdrant.getCollection(COLLECTION_NAME)
    const currentSize = info.config.params.vectors?.size || (info.config.params.vectors as any).default?.size

    if (currentSize !== vectorSize) {
      console.log(`Vector size changed (${currentSize} -> ${vectorSize}). Recreating collection...`)
      await qdrant.deleteCollection(COLLECTION_NAME)
      await qdrant.createCollection(COLLECTION_NAME, {
        vectors: { size: vectorSize, distance: 'Cosine' }
      })
    }
  } else {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: vectorSize, distance: 'Cosine' }
    })
    console.log(`Collection ${COLLECTION_NAME} created with size ${vectorSize}`)
  }
}

// Пошук релевантних рішень ККС
// Всі дані повертаються прямо з Qdrant — MySQL не потрібна
export async function searchKcsDecisions(
  queryVector: number[],
  limit: number = 5,
  category?: string
) {
  const filter = category && category !== 'unknown' 
    ? { must: [{ key: 'category', match: { value: category } }] }
    : undefined

  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
    filter,
    limit,
    with_payload: true
  })

  return results.map(r => ({
    caseNumber: r.payload?.caseNumber as string,
    date: r.payload?.date as string,
    url: r.payload?.url as string,
    text: r.payload?.text as string,
    score: r.score
  }))
}

// Додати рішення до Qdrant
// Текст рішення зберігається прямо в payload — не в MySQL
export async function addDecision(
  id: string,
  vector: number[],
  payload: {
    caseNumber: string
    category: string
    date: string
    url: string
    text: string
  }
) {
  await qdrant.upsert(COLLECTION_NAME, {
    points: [{ id, vector, payload }]
  })
}
