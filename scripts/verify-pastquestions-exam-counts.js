const fs = require('fs')
const path = require('path')

const file = path.resolve(
  __dirname,
  '..',
  'public',
  'data',
  'pastquestions.csv',
)
const raw = fs.readFileSync(file, 'utf8')

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

const lines = raw.split(/\r?\n/)
if (lines.length === 0) {
  console.error('Empty file')
  process.exit(1)
}

const header = splitCsvLine(lines[0])
const examIndex = header.indexOf('exam')
if (examIndex === -1) {
  console.error('No exam column in header. Header:', header.join(','))
  process.exit(2)
}

const counts = new Map()
const samples = new Map()
let total = 0

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line) continue
  const cols = splitCsvLine(line)
  const examRaw = (cols[examIndex] || '').trim()
  // normalize unquoted empty to truly empty
  const exam = examRaw.replace(/^"|"$/g, '')
  counts.set(exam, (counts.get(exam) || 0) + 1)
  if (!samples.has(exam)) samples.set(exam, [])
  if (samples.get(exam).length < 5)
    samples.get(exam).push({ lineNumber: i + 1, raw: line })
  total++
}

console.log('File:', file)
console.log('Total data rows counted:', total)
console.log('Exam value counts:')
const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
for (const [k, v] of sorted) {
  const keyDisplay = k === '' ? '<EMPTY>' : k
  console.log(`  ${keyDisplay}: ${v}`)
}

console.log('\nSamples (up to 5) per exam value:')
for (const [k, v] of sorted) {
  const keyDisplay = k === '' ? '<EMPTY>' : k
  console.log(`\n--- ${keyDisplay} ---`)
  const s = samples.get(k) || []
  for (const r of s) {
    console.log(`line ${r.lineNumber}: ${r.raw}`)
  }
}

// Exit codes: 0 success
process.exit(0)
