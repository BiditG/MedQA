#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

function parseCSV(text) {
  const rows = []
  let cur = ''
  let row = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
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

async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.error('Usage: csv-to-glossary.js <input.csv> [output.json]')
    process.exit(2)
  }
  const input = path.resolve(process.cwd(), args[0])
  const outFile = path.resolve(
    process.cwd(),
    args[1] || 'public/disease-glossary.json',
  )
  const text = fs.readFileSync(input, 'utf-8')
  const rows = parseCSV(text)
  let start = 0
  if (rows.length && rows[0].some((c) => /english|nepali/i.test(c))) start = 1
  const parsed = []
  for (let i = start; i < rows.length; i++) {
    const r = rows[i]
    const english = (r[0] || '').trim()
    const nepali = (r[1] || '').trim()
    if (english || nepali) parsed.push({ english, nepali })
  }
  fs.writeFileSync(outFile, JSON.stringify(parsed, null, 2), 'utf-8')
  console.log('Wrote', parsed.length, 'entries to', outFile)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
