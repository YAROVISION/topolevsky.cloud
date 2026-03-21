import { NextRequest, NextResponse } from 'next/server'
import { addDecision, initCollection } from '@/lib/qdrant'
import { createEmbedding } from '@/lib/embeddings'
import { randomUUID } from 'crypto'

// Захист endpoint — тільки для адміна
function isAuthorized(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  return token === process.env.ADMIN_SECRET_TOKEN
}

// Масове завантаження масиву посилань
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { links } = await req.json() // [{ url, caseNumber, date }]
    
    await initCollection()

    console.log(`[Batch Ingest] Processing ${links.length} links...`)

    // 1. Завантажуємо всі тексти (послідовно, щоб не спамити реєстр)
    const decisions: any[] = []
    for (const link of links) {
      try {
        const text = await new Promise<string>((resolve, reject) => {
          const https = require('https')
          const options = {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7'
            },
            timeout: 10000
          }
          https.get(link.url, options, (res: any) => {
            let data = ''
            res.on('data', (chunk: any) => { data += chunk })
            res.on('end', () => resolve(data))
          }).on('error', (err: any) => reject(err))
        })
        decisions.push({ ...link, text })
      } catch (err) {
        console.error(`[Batch Ingest] Failed to fetch ${link.caseNumber}:`, err)
      }
    }

    if (decisions.length === 0) {
      return NextResponse.json({ success: false, error: 'No texts fetched' })
    }

    // 2. Створюємо вектори одним батчем через Voyage AI
    const texts = decisions.map(d => d.text)
    const { createEmbeddings } = require('@/lib/embeddings')
    const vectors = await createEmbeddings(texts)

    // 3. Зберігаємо в Qdrant батчем
    const points = decisions.map((d, i) => {
      const vector = vectors[i]
      if (!vector || !Array.isArray(vector)) {
        throw new Error(`Invalid vector for ${d.caseNumber}`)
      }
      return {
        id: randomUUID(),
        vector: vector,
        payload: {
          caseNumber: d.caseNumber,
          date: d.date,
          url: d.url,
          text: d.text
        }
      }
    })

    console.log(`[Batch Ingest] Upserting ${points.length} points to Qdrant (vector size: ${points[0].vector.length})...`)

    const { qdrant, COLLECTION_NAME } = require('@/lib/qdrant')
    await qdrant.upsert(COLLECTION_NAME, { points })

    return NextResponse.json({ success: true, processed: decisions.length })
  } catch (error) {
    console.error('[Batch Ingest] Error:', error)
    if (error && (error as any).data) {
      console.error('[Batch Ingest] Error Details:', JSON.stringify((error as any).data, null, 2))
    }
    return NextResponse.json(
      { error: 'Batch ingest failed', details: String(error) },
      { status: 500 }
    )
  }
}

// Завантаження одного рішення за посиланням з реєстру
export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { url, caseNumber, date } = await req.json()

    console.log(`[Ingest] Fetching registry: ${url}`)
    // Завантажуємо текст рішення з реестру суду через raw https
    const text = await new Promise<string>((resolve, reject) => {
      const https = require('https')
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      }
      
      https.get(url, options, (res: any) => {
        let data = ''
        res.on('data', (chunk: any) => { data += chunk })
        res.on('end', () => resolve(data))
      }).on('error', (err: any) => reject(err))
    })
    console.log(`[Ingest] Got text (${text.length} chars). Initializing collection...`)

    await initCollection()
    console.log(`[Ingest] Collection ready. Creating embedding...`)

    // Все зберігається в Qdrant — MySQL не залучається
    const vector = await createEmbedding(text)
    console.log(`[Ingest] Embedding created. Saving to Qdrant...`)

    await addDecision(randomUUID(), vector, {
      caseNumber,
      date,
      url,
      text
    })
    console.log(`[Ingest] Success: ${caseNumber}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ingest error:', error)
    if (error instanceof Error && (error as any).cause) {
      console.error('Error cause:', (error as any).cause)
    }
    return NextResponse.json(
      { error: 'Failed to ingest decision', details: String(error) + ( (error as any).cause ? ' ' + String((error as any).cause) : '' ) },
      { status: 500 }
    )
  }
}
