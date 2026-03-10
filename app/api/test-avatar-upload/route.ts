import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const avatar = formData.get('avatar') as File | null
    if (!avatar || !(avatar as any).size) {
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    const size = (avatar as any).size as number
    const type = (avatar as any).type as string
    const MAX_BYTES = 2 * 1024 * 1024
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (size > MAX_BYTES) {
      return NextResponse.json({ error: 'TOO_LARGE' }, { status: 400 })
    }
    if (type && !allowed.includes(type)) {
      return NextResponse.json({ error: 'BAD_TYPE' }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const safeName = `test-${Date.now()}-${String((avatar as File).name).replace(/[^a-z0-9.\-]/gi, '')}`
    const buffer = Buffer.from(await (avatar as File).arrayBuffer())
    const filePath = path.join(uploadsDir, safeName)
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({ success: true, url: `/uploads/${safeName}` })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 })
  }
}
