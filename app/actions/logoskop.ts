'use server'

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'
import { searchKcsDecisions as searchQdrant } from '@/lib/qdrant'
import { createEmbedding } from '@/lib/embeddings'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '')

// Пошук релевантних рішень ККС через Qdrant
async function searchKcsDecisions(text: string) {
  const embedding = await createEmbedding(text)
  return searchQdrant(embedding)
}

export async function analyzeDocument(
  text: string,
  type: string,
  useKcs: boolean = false,
  mainTab: string = 'criminal'
): Promise<{
  analysis: string
  sources: Array<{
    caseNumber: string
    date: string
    url: string
    score: number
  }>
}> {
  if (!process.env.GOOGLE_AI_API_KEY && !process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_AI_API_KEY or GOOGLE_API_KEY is not set')
  }

  const isCriminal = mainTab === 'criminal'
  const sectorName = isCriminal ? 'кримінального' : 'адміністративного'

  // Вибираємо відповідний промпт Lexis залежно від типу аналізу
  let systemPrompt = ''
  try {
    const promptFilename = useKcs
      ? (isCriminal ? 'Lexis_deep_prompt.md' : 'Lexis_admin_deep_prompt.md')
      : isCriminal
        ? 'Lexis_simple_prompt.md'
        : 'Lexis_admin_simple_prompt.md'
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
        const sectorPrefix = isCriminal ? 'ККС' : 'КАС'
        kcsContext = `\n\n===ЕТАЛОННІ РІШЕННЯ ${sectorPrefix}===\n${decisions
          .map(
            (d, i) =>
              `ЕТАЛОН ${i + 1}\nСправа №${d.caseNumber} від ${d.date}\n${d.text}`
          )
          .join('\n---\n')}`
      }
    } catch (error) {
      console.error('KCS/KAS search failed:', error)
    }
  }

  const typeHint =
    type !== 'auto'
      ? `\n\nТип документа вказано користувачем: ${type}`
      : ''

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro-latest',
      systemInstruction: systemPrompt + `\n\nТи — професійний юрист. Проведи логічний аналіз наступного документа ${sectorName} провадження. Працюй виключно в межах юридичного аналізу.`,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ]
    })

    const prompt = `Проаналізуй наступний процесуальний документ ${sectorName} провадження України:${typeHint}${kcsContext}\n\n---\n${text}\n---`

    const result = await model.generateContent(prompt)
    const response = await result.response

    return {
      analysis: response.text() || '',
      sources
    }
  } catch (error) {
    console.error('Error in analyzeDocument:', error)
    throw new Error('Failed to analyze document')
  }
}
