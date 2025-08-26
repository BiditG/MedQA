import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const entries = body?.entries
    if (!Array.isArray(entries))
      return NextResponse.json({ error: 'Invalid entries' }, { status: 400 })
    const out = JSON.stringify(entries, null, 2)
    const filePath = path.resolve(
      process.cwd(),
      'public',
      'disease-glossary.json',
    )
    await fs.promises.writeFile(filePath, out, 'utf-8')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
