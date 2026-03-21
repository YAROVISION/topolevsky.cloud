import { QdrantClient } from '@qdrant/js-client-rest'

export const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
  apiKey: process.env.QDRANT_API_KEY
})

export const COLLECTION_NAME = 'kcs_decisions'

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
  limit: number = 5
) {
  const results = await qdrant.search(COLLECTION_NAME, {
    vector: queryVector,
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
    date: string
    url: string
    text: string
  }
) {
  await qdrant.upsert(COLLECTION_NAME, {
    points: [{ id, vector, payload }]
  })
}
