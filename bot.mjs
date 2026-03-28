import 'dotenv/config';
import mysql from 'mysql2/promise';
import neo4j from 'neo4j-driver';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Конфігурація ---
const {
  MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT = 3306,
  GOOGLE_AI_API_KEY,
  BATCH_SIZE = 5,
  INTERVAL_MS = 5000
} = process.env;

const NEO4J_URI = process.env.NEO4J_URI || 'https://neo4j.lexis.blog';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'Svoboda13Muslic!!!';

if (!GOOGLE_AI_API_KEY) {
  console.error('❌ GOOGLE_AI_API_KEY не знайдено');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- Підключення ---
let mysqlConn;
let neoDriver;

async function initConnections() {
  try {
    mysqlConn = await mysql.createPool({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DB,
      port: Number(MYSQL_PORT),
      waitForConnections: true,
      connectionLimit: 10
    });
    console.log('✓ MySQL підключено');

    neoDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    await neoDriver.verifyConnectivity();
    console.log('✓ Neo4j підключено');
  } catch (err) {
    console.error('❌ Помилка підключення:', err.message);
    process.exit(1);
  }
}

// --- Логіка ШІ ---
async function categorizeWord(word) {
  const prompt = `Визнач рівень абстракції для слова "${word}" за шкалою від 1 до 10.
  1 (Філософські поняття), 10 (Максимально конкретні).
  Також визнач список гіпернімів (більш загальних) та гіпонімів (більш конкретних).
  Відповідь надай ТІЛЬКИ у форматі JSON:
  {
    "level": число від 1 до 10,
    "hypernyms": [{"word": "слово1", "level": 7}],
    "hyponyms": [{"word": "слово2", "level": 10}]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/```json|```/g, '');
    return JSON.parse(text);
  } catch (err) {
    console.error(`  - Помилка ШІ для "${word}":`, err.message);
    return null;
  }
}

// --- Синхронізація з базами ---
async function processBatch() {
  console.log(`\n🔍 Пошук нових слів (batch: ${BATCH_SIZE})...`);
  
  const [words] = await mysqlConn.execute(
    'SELECT id, word FROM word WHERE abstraction_level IS NULL OR abstraction_level = 0 LIMIT ?',
    [Number(BATCH_SIZE)]
  );

  if (words.length === 0) {
    console.log('😴 Нових слів не знайдено. Чекаю...');
    return;
  }

  for (const { id, word } of words) {
    console.log(`🚀 Обробка: "${word}" (ID: ${id})`);
    
    const aiData = await categorizeWord(word);
    if (!aiData) continue;

    const session = neoDriver.session();
    try {
      // 1. Оновлення MySQL
      await mysqlConn.execute(
        'UPDATE word SET abstraction_level = ? WHERE id = ?',
        [aiData.level, id]
      );

      // 2. Neo4j: Створення ноди слова
      await session.run(
        'MERGE (w:Word {name: $word}) SET w.level = $level',
        { word: word.toLowerCase(), level: aiData.level }
      );

      // 3. Обробка Гіпернімів
      for (const hyper of aiData.hypernyms) {
        // Додаємо в Neo4j
        await session.run(`
          MERGE (h:Word {name: $name}) SET h.level = $level
          MERGE (w:Word {name: $word})
          MERGE (w)-[:HYPERNYM_OF]->(h)
        `, { name: hyper.word.toLowerCase(), level: hyper.level, word: word.toLowerCase() });
        
        // В MySQL просто оновлюємо рівень якщо слово існує
        await mysqlConn.execute(
          'UPDATE word SET abstraction_level = ? WHERE word = ? AND abstraction_level IS NULL',
          [hyper.level, hyper.word]
        );
      }

      // 4. Обробка Гіпонімів
      for (const hypo of aiData.hyponyms) {
        await session.run(`
          MERGE (h:Word {name: $name}) SET h.level = $level
          MERGE (w:Word {name: $word})
          MERGE (h)-[:HYPERNYM_OF]->(w)
        `, { name: hypo.word.toLowerCase(), level: hypo.level, word: word.toLowerCase() });

        await mysqlConn.execute(
          'UPDATE word SET abstraction_level = ? WHERE word = ? AND abstraction_level IS NULL',
          [hypo.level, hypo.word]
        );
      }

      console.log(`✅ Готово: ${word} (Level: ${aiData.level})`);
    } catch (err) {
      console.error(`❌ Помилка БД для "${word}":`, err.message);
    } finally {
      await session.close();
    }
  }
}

// --- Main ---
async function start() {
  console.log('🚀 Lexical Graph Bot запущено (Gemini AI Edition)');
  await initConnections();

  while (true) {
    try {
      await processBatch();
    } catch (err) {
      console.error('❌ Помилка ітерації:', err.message);
    }
    await new Promise(r => setTimeout(r, INTERVAL_MS));
  }
}

start();
