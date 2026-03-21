import { VoyageAIClient as VoyageAI } from 'voyageai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Провайдери та їх параметри
export const PROVIDERS: Record<string, { model: string, size: number, apiKey: string | undefined }> = {
  VOYAGE: {
    model: 'voyage-law-2',
    size: 1024,
    apiKey: process.env.VOYAGE_API_KEY
  },
  GEMINI: {
    model: 'gemini-embedding-2-preview',
    size: 3072,
    apiKey: process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY
  }
}

// Визначаємо активний провайдер
export function getActiveProvider(): string {
  // Пріоритет Gemini для масового завантаження через вищі ліміти
  if (PROVIDERS.GEMINI.apiKey) return 'GEMINI'
  if (PROVIDERS.VOYAGE.apiKey) return 'VOYAGE'
  throw new Error('Embeddings provider API key not found')
}

// Створення одного вектора
export async function createEmbedding(text: string): Promise<number[]> {
  const provider = getActiveProvider()
  const truncated = text.slice(0, 30000) // Безпечний ліміт для обох

  if (provider === 'GEMINI') {
    const genAI = new GoogleGenerativeAI(PROVIDERS.GEMINI.apiKey!)
    const model = genAI.getGenerativeModel({ model: PROVIDERS.GEMINI.model })
    const result = await model.embedContent(truncated)
    return result.embedding.values
  } else {
    const voyage = new VoyageAI({ apiKey: PROVIDERS.VOYAGE.apiKey! })
    const response = await voyage.embed({
      input: truncated,
      model: PROVIDERS.VOYAGE.model
    })
    return response.data?.[0].embedding || []
  }
}

// Створення масиву векторів (батч)
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const provider = getActiveProvider()
  const truncatedTexts = texts.map(t => t.slice(0, 30000))

  if (provider === 'GEMINI') {
    const genAI = new GoogleGenerativeAI(PROVIDERS.GEMINI.apiKey!)
    const model = genAI.getGenerativeModel({ model: PROVIDERS.GEMINI.model })
    const result = await model.batchEmbedContents({
      requests: truncatedTexts.map(t => ({ content: { role: 'user', parts: [{ text: t }] } }))
    })
    return result.embeddings.map(e => e.values)
  } else {
    const voyage = new VoyageAI({ apiKey: PROVIDERS.VOYAGE.apiKey! })
    const response = await voyage.embed({
      input: truncatedTexts,
      model: PROVIDERS.VOYAGE.model
    })
    return (response.data?.map(item => item.embedding) as number[][]) || []
  }
}
