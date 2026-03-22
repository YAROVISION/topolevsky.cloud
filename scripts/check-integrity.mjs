import 'dotenv/config'
import fs from 'fs'
import { QdrantClient } from '@qdrant/js-client-rest'

const COLLECTION_NAME = 'kcs_decisions'

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://qdrant.lexis.blog',
  apiKey: process.env.QDRANT_API_KEY,
  port: 443,
  checkCompatibility: false
})

async function checkIntegrity() {
  console.log(`🔍 Початок звірки бази даних...`)
  
  // 1. Читаємо оригінальний файл
  console.log(`📦 Завантаження оригінального списку...`)
  const links = JSON.parse(fs.readFileSync('./kcs-links.json', 'utf8'))
  console.log(`✅ Всього у списку: ${links.length} справ.`)

  // 2. Витягуємо всі номери справ з Qdrant
  console.log(`📡 Підключення до Qdrant та викачка payload...`)
  let offset = null
  const savedCaseNumbers = new Set()
  let fetchedCount = 0

  try {
    do {
      const response = await qdrant.scroll(COLLECTION_NAME, {
        offset: offset,
        limit: 1000,
        with_payload: true,
        with_vector: false // Нам потрібні тільки метадані
      })

      if (response && response.points) {
        response.points.forEach(point => {
          if (point.payload && point.payload.caseNumber) {
            savedCaseNumbers.add(point.payload.caseNumber)
          }
        })
        fetchedCount += response.points.length
      }
      
      offset = response.next_page_offset
      process.stdout.write(`\r📥 Отримано з Qdrant: ${fetchedCount} документів...`)
    } while (offset)
    
    console.log(`\n✅ Успішно витягнуто ${savedCaseNumbers.size} унікальних номерів справ з Qdrant.`)
  } catch (error) {
    console.error(`\n❌ Помилка з'єднання з Qdrant:`, error.message)
    process.exit(1)
  }

  // 3. Звірка масивів
  console.log(`\n⚙️ Обчислення різниці...`)
  const missing = []
  
  for (let i = 0; i < links.length; i++) {
    if (!savedCaseNumbers.has(links[i].caseNumber)) {
      missing.push({
        index: i,
        caseNumber: links[i].caseNumber,
        url: links[i].url,
        date: links[i].date
      })
    }
  }

  // 4. Звіти
  console.log(`\n📊 РЕЗУЛЬТАТИ ЗВІРКИ:`)
  console.log(`- Всього в 'kcs-links.json': ${links.length}`)
  console.log(`- Знайдено в Qdrant: ${savedCaseNumbers.size}`)
  console.log(`- Відсутні у базі: ${missing.length}`)

  if (missing.length > 0) {
    const outputFile = './missing-kcs.json'
    fs.writeFileSync(outputFile, JSON.stringify(missing, null, 2))
    console.log(`\n⚠️ Увага! ${missing.length} документів не знайдено.`)
    console.log(`📁 Їх індекси та посилання збережено у файл: ${outputFile}`)
    console.log(`👉 Щоб дозавантажити їх, ви можете написати новий скрипт, який читатиме 'missing-kcs.json' замість оригіналу.`)
  } else {
    console.log(`\n🎉 ІДЕАЛЬНО! Всі ${links.length} документів успішно завантажені у векторну базу.`)
  }
}

checkIntegrity()
