import 'dotenv/config'
import { GoogleGenerativeAI } from '@google/generative-ai'
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY || '');
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent('hi');
    console.log('✅ gemini-1.5-pro-latest worked:', result.response.text().substring(0, 50));
  } catch(e) { console.error('Error gemini-1.5-pro-latest:', e.message); }
  
  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-002' });
    const result2 = await model2.generateContent('hi');
    console.log('✅ gemini-1.5-pro-002 worked:', result2.response.text().substring(0, 50));
  } catch(e) { console.error('Error gemini-1.5-pro-002:', e.message); }
}
test();
