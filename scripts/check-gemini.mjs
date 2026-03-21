import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY
  console.log('Using API key:', apiKey ? apiKey.substring(0, 5) + '...' : 'MISSING')
  
  const genAI = new GoogleGenerativeAI(apiKey || '')
  
  try {
    // There is no listModels in the standard SDK easily accessible?
    // Actually we can try a few common names
    const models = ['text-embedding-004', 'embedding-001', 'models/text-embedding-004', 'models/embedding-001']
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m })
        await model.embedContent('test')
        console.log(`✅ Model "${m}" is WORKING`)
      } catch (e) {
        console.log(`❌ Model "${m}" FAILED: ${e.message}`)
      }
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

listModels()
