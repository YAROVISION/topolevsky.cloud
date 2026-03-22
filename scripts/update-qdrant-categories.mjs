import 'dotenv/config'
import { QdrantClient } from '@qdrant/js-client-rest'

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'https://qdrant.lexis.blog',
  apiKey: process.env.QDRANT_API_KEY,
  port: 443,
  checkCompatibility: false
})

const COLLECTION_NAME = 'kcs_decisions'

/**
 * Визначає категорію за номером справи (спрощена логіка)
 */
function detectCategory(caseNumber) {
  if (!caseNumber) return 'unknown'
  const clean = caseNumber.toLowerCase().trim()
  
  // 1. Прямі суфікси (найнадійніші)
  if (clean.endsWith('-а') || clean.includes('/а-') || clean.includes(' 2-а')) return 'administrative'
  if (clean.endsWith('-к') || clean.startsWith('1-')) return 'criminal'
  if (clean.endsWith('-ц') || clean.startsWith('2-')) return 'civil'

  // 2. Коди судів
  const prefix = clean.split('/')[0]
  const adminCodes = [
    '120', '140', '160', '200', '240', '280', '320', '380', '400', '420', 
    '440', '460', '480', '500', '520', '540', '560', '580', '600', '620', 
    '640', '801', '802', '803', '804', '805', '806', '807', '808', '809', 
    '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', 
    '820', '821', '822', '823', '824', '825', '826', '990', '991', '1570', '2602'
  ]
  
  if (adminCodes.includes(prefix)) return 'administrative'
  
  return 'criminal'
}

async function migrate() {
  console.log(`🚀 Початок міграції для колекції ${COLLECTION_NAME}...`)
  
  try {
    let nextOffset = null
    let totalProcessed = 0
    let updatedCount = 0

    do {
      const response = await qdrant.scroll(COLLECTION_NAME, {
        limit: 100,
        offset: nextOffset,
        with_payload: true
      })

      const criminalBatch = []
      const administrativeBatch = []
      const civilBatch = []

      for (const point of response.points) {
        const caseNumber = point.payload?.caseNumber
        const currentCategory = point.payload?.category
        const detectedCategory = detectCategory(caseNumber)
        
        if (detectedCategory !== 'unknown' && detectedCategory !== currentCategory) {
          if (detectedCategory === 'criminal') criminalBatch.push(point.id)
          else if (detectedCategory === 'administrative') administrativeBatch.push(point.id)
          else if (detectedCategory === 'civil') civilBatch.push(point.id)
        }
        totalProcessed++
      }

      // Батч-оновлення (швидше в рази)
      if (criminalBatch.length > 0) {
        await qdrant.setPayload(COLLECTION_NAME, { payload: { category: 'criminal' }, points: criminalBatch })
        updatedCount += criminalBatch.length
      }
      if (administrativeBatch.length > 0) {
        await qdrant.setPayload(COLLECTION_NAME, { payload: { category: 'administrative' }, points: administrativeBatch })
        updatedCount += administrativeBatch.length
      }
      if (civilBatch.length > 0) {
        await qdrant.setPayload(COLLECTION_NAME, { payload: { category: 'civil' }, points: civilBatch })
        updatedCount += civilBatch.length
      }

      nextOffset = response.next_page_offset
      console.log(`📡 Оброблено документів: ${totalProcessed}... (Оновлено: ${updatedCount})`)
    } while (nextOffset)

    console.log(`\n🏁 Міграція завершена!`)
    console.log(`- Всього перевірено: ${totalProcessed}`)
    console.log(`- Всього оновлено: ${updatedCount}`)
    
  } catch (error) {
    console.error('❌ Помилка міграції:', error)
  }
}

migrate()
