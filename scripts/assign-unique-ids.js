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
      row.push(cur)
      cur = ''
      if (row.length) rows.push(row)
      row = []
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else cur += ch
  }
  if (cur !== '' || row.length) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function toCSV(rows) {
  return (
    rows
      .map((r) =>
        r
          .map((cell) => {
            const s = cell == null ? '' : String(cell)
            return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
          })
          .join(','),
      )
      .join('\n') + '\n'
  )
}

function pad(n, width) {
  const s = String(n)
  return s.length >= width ? s : '0'.repeat(width - s.length) + s
}

function printUsage() {
  console.log(
    'Usage: node scripts/assign-unique-ids.js [--input <file>] [--prefix <prefix>] [--start <n>] [--pad <width>] [--dry-run]',
  )
  console.log(
    'Defaults: input=public/data/ceemcq.csv, prefix=cee, start=1, pad=6',
  )
}

const argv = process.argv.slice(2)
let input = path.join('public', 'data', 'ceemcq.csv')
let prefix = 'cee'
let start = 1
let padWidth = 6
let dryRun = false
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--input' || a === '-i') input = argv[++i]
  else if (a === '--prefix' || a === '-p') prefix = argv[++i]
  else if (a === '--start' || a === '-s') start = parseInt(argv[++i], 10)
  else if (a === '--pad') padWidth = parseInt(argv[++i], 10)
  else if (a === '--dry-run') dryRun = true
  else if (a === '--help' || a === '-h') {
    printUsage()
    process.exit(0)
  }
}

if (!fs.existsSync(input)) {
  console.error('Input not found:', input)
  process.exit(2)
}
const text = fs.readFileSync(input, 'utf8')
const rows = parseCSV(text)
if (!rows.length) {
  console.error('No rows parsed')
  process.exit(3)
}
const header = rows[0]
const idIdx = header.map((h) => (h || '').trim().toLowerCase()).indexOf('id')
if (idIdx === -1) {
  console.error('No id column in CSV header')
  process.exit(4)
}

const out = [header]
let n = start
for (let r = 1; r < rows.length; r++) {
  const row = rows[r]
  if (!row || row.length === 0) {
    out.push(row)
    continue
  }
  const newId = prefix + '_' + pad(n, padWidth)
  row[idIdx] = newId
  n++
  out.push(row)
}

if (dryRun) {
  console.log('[dry-run] Would assign', n - start, 'ids to', input)
  process.exit(0)
}

const ts = new Date().toISOString().replace(/[:.]/g, '-')
const backup = input + '.' + ts + '.bak'
fs.writeFileSync(backup, text)
fs.writeFileSync(input, toCSV(out))
console.log('Backup written to', backup)
console.log('Wrote', input, 'rows=', out.length - 1)
