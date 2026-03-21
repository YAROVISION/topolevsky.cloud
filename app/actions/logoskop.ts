'use server'

import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { searchKcsDecisions as searchQdrant } from '@/lib/qdrant'
import { createEmbedding } from '@/lib/embeddings'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

// Пошук релевантних рішень ККС через Qdrant
async function searchKcsDecisions(text: string) {
  const embedding = await createEmbedding(text)
  return searchQdrant(embedding)
}

export async function analyzeDocument(
  text: string,
  type: string,
  useKcs: boolean = false
): Promise<{
  analysis: string
  sources: Array<{
    caseNumber: string
    date: string
    url: string
    score: number
  }>
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }

  // Вибираємо відповідний промпт Lexis залежно від типу аналізу (для платних чи безкоштовних)
  let systemPrompt = ''
  try {
    const promptFilename = useKcs ? 'Lexis_deep_prompt.md' : 'Lexis_simple_prompt.md'
    const promptPath = path.join(process.cwd(), 'docs', promptFilename)
    systemPrompt = fs.readFileSync(promptPath, 'utf8')
  } catch (error) {
    throw new Error('Lexis prompt file is missing in docs/ directory')
  }

  // Якщо увімкнений пошук по ККС — знаходимо релевантні рішення з Qdrant
  let kcsContext = ''
  let sources: Array<{
    caseNumber: string
    date: string
    url: string
    score: number
  }> = []

  if (useKcs) {
    try {
      const decisions = await searchKcsDecisions(text)
      sources = decisions.map(d => ({
        caseNumber: d.caseNumber,
        date: d.date,
        url: d.url,
        score: d.score
      }))

      if (decisions.length > 0) {
        kcsContext = `\n\n===ЕТАЛОННІ РІШЕННЯ ККС===\n${decisions
          .map(
            (d, i) =>
              `ЕТАЛОН ${i + 1}\nСправа №${d.caseNumber} від ${d.date}\n${d.text}`
          )
          .join('\n---\n')}`
      }
    } catch (error) {
      console.error('KCS search failed:', error)
      // Продовжуємо без рішень ККС якщо пошук не вдався
    }
  }

  const typeHint =
    type !== 'auto'
      ? `\n\nТип документа вказано користувачем: ${type}`
      : ''

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Проаналізуй наступний процесуальний документ кримінального провадження України:${typeHint}${kcsContext}\n\n---\n${text}\n---`
        }
      ]
    })

    return {
      analysis:
        response.content[0].type === 'text'
          ? response.content[0].text
          : '',
      sources
    }
  } catch (error) {
    console.error('Error in analyzeDocument:', error)
    throw new Error('Failed to analyze document')
  }
}
