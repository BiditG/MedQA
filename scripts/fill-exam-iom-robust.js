const fs = require('fs')
const path = require('path')

const file = path.resolve(
  __dirname,
  '..',
  'public',
  'data',
  'pastquestions.csv',
)
const backup = file + '.bak.refillIOM'

function splitCsvLine(line) {
  const parts = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"'
        i++
        continue
      }
      inQuote = !inQuote
      continue
    }
    if (ch === ',' && !inQuote) {
      parts.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  parts.push(cur)
  return parts
}

function serializeRow(cols) {
  return cols
    .map((c) => {
      if (c == null) return ''
      const s = String(c)
      if (s.includes('"')) return '"' + s.replace(/"/g, '""') + '"'
      if (s.includes(',') || s.includes('\n') || s.includes('\r'))
        return '"' + s + '"'
      return s
    })
    .join(',')
}

const raw = fs.readFileSync(file, 'utf8')
fs.copyFileSync(file, backup)
console.log('Backup written to', backup)

const lines = raw.split(/\r?\n/)
if (!lines.length) {
  console.error('Empty file')
  process.exit(1)
}

let header = splitCsvLine(lines[0]).map((h) => h.trim())
let examIndex = header.indexOf('exam')
if (examIndex === -1) {
  // append exam column
  header.push('exam')
  examIndex = header.length - 1
}

const out = [serializeRow(header)]
let total = 0
let replaced = 0

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (line.trim() === '') continue
  const cols = splitCsvLine(line)
  // ensure length
  while (cols.length < header.length) cols.push('')
  const examRaw = (cols[examIndex] || '').trim().replace(/^"|"$/g, '')
  if (!examRaw) {
    cols[examIndex] = 'IOM'
    replaced++
  }
  out.push(serializeRow(cols))
  total++
}

fs.writeFileSync(file, out.join('\n'), 'utf8')
console.log(
  `Wrote ${total} data rows. Replaced ${replaced} blank exam values with IOM.`,
)
