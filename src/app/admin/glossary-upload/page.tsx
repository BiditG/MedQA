'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function parseCSV(text: string) {
  // Simple CSV parser supporting quoted fields
  const rows: string[][] = []
  let cur = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      // lookahead for escaped quote
      if (inQuotes && text[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (cur !== '' || row.length > 0) {
        row.push(cur)
        rows.push(row)
        row = []
        cur = ''
      }
      // skip additional newline characters
      while (text[i + 1] === '\n' || text[i + 1] === '\r') i++
    } else {
      cur += ch
    }
  }
  if (cur !== '' || row.length > 0) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

export default function Page() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [entries, setEntries] = useState<
    Array<{ english: string; nepali: string }>
  >([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setMessage(null)
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    const text = await f.text()
    const rows = parseCSV(text)
    // try to detect header
    let start = 0
    if (rows.length && rows[0].some((c) => /english|nepali/i.test(c))) start = 1
    const parsed: Array<{ english: string; nepali: string }> = []
    for (let i = start; i < rows.length; i++) {
      const r = rows[i]
      if (!r) continue
      // accept rows with at least two columns
      const english = (r[0] ?? '').trim()
      const nepali = (r[1] ?? '').trim()
      if (english || nepali) parsed.push({ english, nepali })
    }
    setEntries(parsed)
  }

  async function upload() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/upload-glossary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      })
      if (!res.ok) {
        const body = await res.text()
        setMessage(`Upload failed: ${body}`)
      } else {
        setMessage('Glossary uploaded successfully.')
      }
    } catch (err: any) {
      setMessage(String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex w-full flex-1 flex-col items-center py-8">
      <div className="w-full max-w-4xl px-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload disease glossary (CSV)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              CSV should have two columns: english, nepali. A header row is
              optional. Quoted fields are supported.
            </p>

            <div className="flex items-center gap-3">
              <Input type="file" accept=".csv,text/csv" onChange={onFile} />
              <Button
                onClick={upload}
                disabled={loading || entries.length === 0}
              >
                {loading ? 'Uploading…' : 'Upload'}
              </Button>
            </div>

            {fileName && <div className="mt-3 text-sm">File: {fileName}</div>}
            <div className="mt-4 text-sm">
              <div>{entries.length} entries parsed</div>
              {entries.slice(0, 10).map((e, i) => (
                <div key={i} className="mt-2 flex gap-4">
                  <div className="w-1/2 text-sm">{e.english || '—'}</div>
                  <div className="w-1/2 text-sm">{e.nepali || '—'}</div>
                </div>
              ))}
            </div>

            {message && <div className="mt-4 text-sm">{message}</div>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
