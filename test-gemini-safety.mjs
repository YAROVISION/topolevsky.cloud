import 'dotenv/config'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    })

    const prompt = 'Проаналізуй обставини кримінальної справи: вбивство з використанням зброї (стаття 115 ККУ).'
    
    console.log(`\nTesting ${modelName}...`)
    const result = await model.generateContent(prompt)
    console.log(`Success with ${modelName}:`, result.response.text().substring(0, 100) + '...')
  } catch (err) {
    if (err.message.includes('PROHIBITED_CONTENT')) {
      console.log(`BLOCKED PROHIBITED_CONTENT: ${modelName}`);
    } else {
      console.error(`Error with ${modelName}:`, err.message)
    }
  }
}

async function run() {
  await testModel('gemini-2.5-pro'); // Baseline that failed
  await testModel('gemini-3-pro-preview');
  await testModel('gemini-3-flash-preview');
}

run()
