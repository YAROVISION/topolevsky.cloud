// Запуск: node scripts/ingest-missing.mjs
// Спеціальний скрипт, який читає СПЕЦИФІЧНО файл missing-kcs.json 
// і дозавантажує загублені посилання. Включає захист від помилок (retries).

import 'dotenv/config'
import fs from 'fs'

const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Читаємо список ВІДСУТНІХ файлів
const missingFile = './missing-kcs.json'

if (!fs.existsSync(missingFile)) {
  console.log(`❌ Файл ${missingFile} не знайдено! Спочатку запустіть node scripts/check-integrity.mjs`)
  process.exit(1)
}

const links = JSON.parse(fs.readFileSync(missingFile, 'utf8'))

const LIMIT = links.length // В цьому скрипті за замовчуванням лімітом є довжина всього списку

// Рандомні проміжки часу
const DELAYS = [3000, 4000, 6000, 7000]

console.log(`\n🚀 КОНФІГУРАЦІЯ ДОЗАВАНТАЖЕННЯ:`)
console.log(`- Всього відсутніх документів у базі: ${LIMIT}`)
console.log(`- Режим: Точкове дозавантаження (з 5-секундними Retry при помилках)\n`)

let processed = 0
let errors = 0
let totalAttempts = 0
const failedLinks = []

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

for (let i = 0; i < LIMIT; i++) {
  const batch = [links[i]]
  totalAttempts++
  
  let success = false
  let retries = 0
  const maxRetries = 3

  while (!success && retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`⚠️ Повторна спроба (${retries}/${maxRetries}) для відсутнього [${i}] через 5с...`)
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
        console.log(`✅ [${i}] ${processed}/${LIMIT} успішно відновлено (номер справи: ${batch[0].caseNumber})`)
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
  if (success && i + 1 < LIMIT) {
    const waitTime = DELAYS[Math.floor(Math.random() * DELAYS.length)]
    console.log(`⏳ Чекаємо ${waitTime/1000}с...`)
    await sleep(waitTime)
  }
}

// Запис невдалих посилань у файл для подальшого аналізу
if (failedLinks.length > 0) {
  const failedFile = './failed-missing-ingests.json'
  fs.writeFileSync(failedFile, JSON.stringify(failedLinks, null, 2))
  console.log(`\n📁 На жаль, ${failedLinks.length} завантажень так і не вдалися. Збережено у файл ${failedFile}`)
} else {
  console.log(`\n🎉 Всі відсутні документи були успішно додані до векторної бази Qdrant!`)
}

console.log(`\n🏁 Фінальний звіт дозавантаження:`)
console.log(`- Відновлено успішно: ${processed}`)
console.log(`- Безнадійні помилки (не завантажено): ${errors}`)
