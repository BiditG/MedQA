import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Not allowed in production' },
        { status: 403 },
      )
    }
    const body = await req.json()
    const { model, desiredRadius, margin, allowUserControl } = body
    if (!model)
      return NextResponse.json({ error: 'model required' }, { status: 400 })

    const filePath = path.join(
      process.cwd(),
      'src',
      'data',
      'model-overrides.json',
    )
    const raw = fs.readFileSync(filePath, 'utf8')
    const obj = JSON.parse(raw || '{}')
    obj[model] = { desiredRadius, margin, allowUserControl }
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8')
    return NextResponse.json({ ok: true, model, entry: obj[model] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
