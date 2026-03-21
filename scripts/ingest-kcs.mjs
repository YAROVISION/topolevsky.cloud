// Запуск: node scripts/ingest-kcs.mjs --start=7050 --end=7500
// Завантажує рішення ККС з файлу посилань прямо в Qdrant

import 'dotenv/config'
import fs from 'fs'

const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Список посилань у форматі:
// [{ "url": "...", "caseNumber": "...", "date": "..." }]
const links = JSON.parse(fs.readFileSync('./kcs-links.json', 'utf8'))

const args = process.argv.slice(2)
const startArg = args.find(a => a.startsWith('--start=') || a.startsWith('--offset='))
const endArg = args.find(a => a.startsWith('--end='))
const limitArg = args.find(a => a.startsWith('--limit='))

const START_INDEX = startArg ? parseInt(startArg.split('=')[1]) : 0
const END_INDEX = endArg ? parseInt(endArg.split('=')[1]) : links.length
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : 500 // Всього не більше 500 за раз

// Рандомні проміжки часу: 3, 4, 6 або 7 секунд
const DELAYS = [3000, 4000, 6000, 7000]

console.log(`\n🚀 Конфігурація завантаження:`)
console.log(`- Діапазон індексів: ${START_INDEX} -> ${END_INDEX}`)
console.log(`- Ліміт на цей запуск: ${LIMIT} документів`)
console.log(`- Всього доступно в базі посилань: ${links.length}`)
console.log(`- Режим: Послідовний (1 запит за раз)\n`)

let processed = 0
let errors = 0
let totalAttempts = 0
const failedLinks = []

// Функція паузи
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

for (let i = START_INDEX; i < END_INDEX; i++) {
  if (totalAttempts >= LIMIT) {
    console.log(`\n🛑 Досягнуто ліміт у ${LIMIT} звернень. Скрипт зупинено.`)
    break
  }

  const batch = [links[i]]
  totalAttempts++
  
  let success = false
  let retries = 0
  const maxRetries = 3

  while (!success && retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`⚠️ Повторна спроба (${retries}/${maxRetries}) для індексу [${i}] через 5с...`)
        await sleep(5000)
      }

      const response = await fetch(`${BASE_URL}/api/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': ADMIN_TOKEN
        },
        body: JSON.stringify({ links: batch })
      })

      const result = await response.json()

      if (result.success) {
        processed++
        success = true
        console.log(`✅ [${i}] ${processed}/${LIMIT} (всього спроб: ${totalAttempts}) завантажено`)
      } else {
        console.error(`❌ [${i}] Помилка сервера:`, result.error, result.details || '')
        retries++
        if (retries > maxRetries) throw new Error(result.error || 'Server error')
      }
    } catch (err) {
      console.error(`❌ [${i}] Помилка мережі/виконання:`, err.message)
      retries++
      if (retries > maxRetries) {
        errors++
        failedLinks.push({ index: i, link: links[i], error: err.message })
        console.log(`⏭️ Пропускаємо індекс [${i}] після ${maxRetries} невдалих спроб.`)
      }
    }
  }

  // Рандомна пауза між успішними документами
  if (success && i + 1 < END_INDEX && totalAttempts < LIMIT) {
    const waitTime = DELAYS[Math.floor(Math.random() * DELAYS.length)]
    console.log(`⏳ Чекаємо ${waitTime/1000}с...`)
    await sleep(waitTime)
  }
}

// Запис невдалих посилань у файл для подальшого аналізу
if (failedLinks.length > 0) {
  const failedFile = './failed-ingests.json'
  fs.writeFileSync(failedFile, JSON.stringify(failedLinks, null, 2))
  console.log(`\n📁 Збережено ${failedLinks.length} невдалих завантажень у файл ${failedFile}`)
}

console.log(`\n🏁 Завершено:`)
console.log(`- Оброблено успішно: ${processed}`)
console.log(`- Помилок: ${errors}`)
console.log(`- Всього спроб: ${totalAttempts}`)
