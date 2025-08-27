import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

function inferLabel(rel: string, name: string): boolean | null {
  const parent = (rel.split(path.sep).filter(Boolean).pop() || '').toLowerCase()
  const fname = name.toLowerCase()
  if (/pneumonia|pnm/.test(parent) || /pneumonia/.test(fname)) return true
  if (
    /normal|no|neg|not|healthy/.test(parent) ||
    /normal|healthy|no|neg|not/.test(fname)
  )
    return false
  return null
}

async function walk(
  dir: string,
  rel = '',
): Promise<Array<{ path: string; label: boolean | null }>> {
  const out: Array<{ path: string; label: boolean | null }> = []
  let entries: any[] = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (err) {
    return out
  }
  for (const e of entries) {
    const eRel = path.join(rel, e.name)
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      const sub = await walk(full, eRel)
      out.push(...sub)
    } else if (e.isFile()) {
      if (e.name.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) {
        out.push({
          path: `/data/Pneumonia/${eRel.replace(/\\/g, '/')}`,
          label: inferLabel(rel, e.name),
        })
      }
    }
  }
  return out
}

export async function GET() {
  const base = path.join(process.cwd(), 'public', 'data', 'Pneumonia')
  const files = await walk(base)
  return NextResponse.json({ files })
}
