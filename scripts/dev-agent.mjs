import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

// Завантажуємо змінні середовища
dotenv.config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function runAgent() {
  const task = process.argv[2];
  if (!task) {
    console.log("❌ Введіть завдання (наприклад: node scripts/dev-agent.mjs 'Виправ фото')");
    return;
  }

  try {
    // 1. Автоматичне визначення робочої моделі
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
    const data = await response.json();
    const availableModel = data.models?.find(m => m.supportedGenerationMethods.includes("generateContent") && m.name.includes("flash"));
    const modelName = availableModel ? availableModel.name.split('/').pop() : "gemini-1.5-flash";

    console.log(`🔍 Використовую модель: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    // 2. Функція для безпечного збору файлів з папок
    const getFilesFromDir = (dir) => {
      if (fs.existsSync(dir) && fs.lstatSync(dir).isDirectory()) {
        return fs.readdirSync(dir)
          .map(f => path.join(dir, f))
          .filter(f => fs.lstatSync(f).isFile()); // Тільки файли, не підпапки
      }
      return [];
    };

    // 3. Збираємо контекст проекту (тільки те, що існує)
    const files = [
      'package.json',
      'lib/db.ts',
      'tailwind.config.ts',
      'tailwind.config.js',
      'next.config.js',
      'next.config.mjs',
      ...getFilesFromDir('./pages/api'),
      ...getFilesFromDir('./components'),
      ...(fs.existsSync('./app') ? ['app/layout.tsx', 'app/page.tsx'] : []),
      ...(fs.existsSync('./pages') ? ['pages/_app.tsx', 'pages/index.tsx', 'pages/index.js'] : [])
    ].filter(f => fs.existsSync(f) && fs.lstatSync(f).isFile());

    let projectSnapshot = "";
    files.forEach(f => {
      const content = fs.readFileSync(f, 'utf8');
      projectSnapshot += `\n--- FILE: ${f} ---\n${content.substring(0, 5000)}\n`;
    });

    // 4. Формуємо промпт для Gemini
    const prompt = `Ти — Senior Fullstack Developer (Next.js, Tailwind, SQL).
Поточний стан проекту:
${projectSnapshot}

ЗАВДАННЯ: ${task}

Відповідай ТІЛЬКИ кодом або короткими інструкціями. Якщо потрібно створити новий файл, вкажи його назву.`;

    console.log("🚀 Агент аналізує проект...");
    const result = await model.generateContent(prompt);
    
    console.log("\n--- РІШЕННЯ ВІД АГЕНТА ---");
    console.log(result.response.text());

  } catch (err) {
    console.error("\n❌ Помилка виконання:", err.message);
  }
}

runAgent();