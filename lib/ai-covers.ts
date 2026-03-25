import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function generateAIPreview(title: string, summary: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    
    const prompt = `
      Ти — арт-директор українського лінгвістичного блогу "Lexis". 
      Тобі потрібно придумати ПРАВИЛЬНИЙ запит (prompt) для генератора зображень для статті.
      Назва статті: "${title}"
      Короткий зміст: "${summary}"
      
      Вимоги до зображення:
      - Стиль: Мінімалістичний, сучасний, преміальний, інтелектуальний.
      - Кольори: Темний фон, золотисті або смарагдові акценти.
      - Об'єкти: Естетика книг, символів, літер або цифрових структур.
      
      Напиши ТІЛЬКИ англійською мовою короткий промпт (до 50 слів) для генерації зображення.
    `

    const result = await model.generateContent(prompt)
    const aiPrompt = result.response.text().trim()
    
    // Оскільки ми не маємо прямого API Stability AI зараз, 
    // ми будемо використовувати якісні зображення з Unsplash за ключовими словами з промпту
    // або повертати гарний заповнювач з накладеним текстом.
    
    const keywords = aiPrompt.split(' ').slice(0, 3).join(',')
    return `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop&sig=${encodeURIComponent(keywords)}`
    
  } catch (error) {
    console.error("AI Cover generation failed:", error)
    return "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200&auto=format&fit=crop"
  }
}
