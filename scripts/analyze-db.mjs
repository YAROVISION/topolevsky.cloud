import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"

dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function run() {
  try {
    console.log("🔍 Отримання списку доступних моделей...");
    
    // Спеціальний метод для перевірки доступності
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Шукаємо будь-яку модель, що підтримує генерацію тексту (Gemini 1.5 або 2.0)
    const availableModel = data.models.find(m => 
      m.supportedGenerationMethods.includes("generateContent") && 
      (m.name.includes("flash") || m.name.includes("pro"))
    );

    if (!availableModel) {
      console.log("❌ Доступних моделей не знайдено. Ваш список:", data.models);
      return;
    }

    const modelName = availableModel.name.split('/').pop();
    console.log(`✅ Знайдено робочу модель: ${modelName}`);

    const model = genAI.getGenerativeModel({ model: modelName });
    const userPrompt = process.argv[2] || "Привіт! Перевір зв'язок.";

    console.log("🚀 Запуск запиту...");
    const result = await model.generateContent(userPrompt);
    console.log("\n--- ВІДПОВІДЬ ---");
    console.log(result.response.text());

  } catch (err) {
    console.error("\n❌ КРИТИЧНА ПОМИЛКА:");
    if (err.message.includes("API key not valid")) {
      console.log("Ваш API Key неправильний. Перевірте .env.local");
    } else if (err.message.includes("quota")) {
      console.log("Квота все ще заблокована. Створіть НОВИЙ проект в AI Studio.");
    } else {
      console.log(err.message);
    }
  }
}

run();