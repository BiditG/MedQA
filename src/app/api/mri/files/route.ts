import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

function inferLabel(rel: string, name: string): string | null {
  const token = (rel + '/' + name).toLowerCase()
  if (/glioma/.test(token)) return 'Glioma'
  if (/meningioma/.test(token)) return 'Meningioma'
  if (/pituitary/.test(token)) return 'Pituitary'
  if (/no[_\- ]?tumou?r|normal|healthy|none/.test(token)) return 'No Tumor'
  return null
}

async function walk(
  dir: string,
  rel = '',
): Promise<Array<{ path: string; label: string | null }>> {
  const out: Array<{ path: string; label: string | null }> = []
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
          path: `/data/MRI/${eRel.replace(/\\/g, '/')}`,
          label: inferLabel(eRel, e.name),
        })
      }
    }
  }
  return out
}

export async function GET() {
  const base = path.join(process.cwd(), 'public', 'data', 'MRI')
  const files = await walk(base)
  return NextResponse.json({ files })
}
