'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function analyzeDocument(text: string, type: string) {
	if (!process.env.GOOGLE_AI_API_KEY) {
		throw new Error('GOOGLE_AI_API_KEY is not set')
	}

	let systemPrompt = ''
	try {
		const promptPath = path.join(process.cwd(), 'logic-system-prompt.md')
		systemPrompt = fs.readFileSync(promptPath, 'utf8')
	} catch (error) {
		console.error('Failed to read system prompt file:', error)
		throw new Error('System prompt configuration is missing')
	}

	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
		const typeHint =
			type !== 'auto' ? `\n\nТип документа вказано користувачем: ${type}` : ''
		const prompt = `${systemPrompt}\n\nПроаналізуй наступний процесуальний документ кримінального провадження України:${typeHint}\n\n---\n${text}\n---`

		const result = await model.generateContent(prompt)
		const response = await result.response
		return response.text()
	} catch (error) {
		console.error('Error in analyzeDocument:', error)
		throw new Error('Failed to analyze document')
	}
}
