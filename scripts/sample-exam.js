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
      } else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      row.push(cur)
      cur = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
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

function escapeCell(s) {
  if (s === undefined || s === null) return ''
  const str = String(s)
  if (str.includes('"') || str.includes(',') || str.includes('\n'))
    return '"' + str.replace(/"/g, '""') + '"'
  return str
}

const dataDir = path.resolve(__dirname, '..', 'public', 'data')
const filled = path.join(dataDir, 'ceemcq.filled.csv')
if (!fs.existsSync(filled)) {
  console.error('Filled CSV not found:', filled)
  process.exit(1)
}
const raw = fs.readFileSync(filled, 'utf8')
const rows = parseCSV(raw)
if (!rows.length) {
  console.error('Empty')
  process.exit(1)
}
const header = rows[0].map((h) => h.trim())
const data = rows.slice(1)

function getCell(row, name) {
  const i = header.findIndex((h) => h.toLowerCase() === name.toLowerCase())
  return i >= 0 ? row[i] || '' : ''
}

function isReal(row) {
  const id = (getCell(row, 'id') || '').toString()
  const q = (getCell(row, 'question') || '').toString().toLowerCase()
  const chapter = (getCell(row, 'chapter') || '').toString().toLowerCase()
  if (id.startsWith('gen_')) return false
  if (q.includes('auto-generated placeholder')) return false
  if (chapter === 'generated') return false
  return true
}

const realRows = data.filter(isReal)
if (!realRows.length) {
  console.error('No real rows found')
  process.exit(1)
}

function shuffle(a) {
  const b = a.slice()
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

const sampleCount = Math.min(100, realRows.length)
const sampled = shuffle(realRows).slice(0, sampleCount)
const outPath = path.join(dataDir, 'sample_exam_100.csv')
const out = [header.join(',')].concat(
  sampled.map((r) => r.map((c) => escapeCell(c)).join(',')),
)
fs.writeFileSync(outPath, out.join('\n'), 'utf8')
console.log('Wrote sample exam to', outPath)
console.log('Total real questions available:', realRows.length)
console.log('Sample size:', sampled.length)

// print first 20 in readable format
const printCount = Math.min(20, sampled.length)
for (let i = 0; i < printCount; i++) {
  const r = sampled[i]
  const id = getCell(r, 'id')
  const subj = getCell(r, 'subject')
  const topic = getCell(r, 'topic')
  const q = getCell(r, 'question')
  const a = getCell(r, 'optionA')
  const b = getCell(r, 'optionB')
  const c = getCell(r, 'optionC')
  const d = getCell(r, 'optionD')
  const ans = getCell(r, 'answer')
  console.log('\n--- Question %d — %s — %s', i + 1, subj, topic)
  console.log('ID:', id)
  console.log('Q:', q)
  if (a) console.log('A)', a)
  if (b) console.log('B)', b)
  if (c) console.log('C)', c)
  if (d) console.log('D)', d)
  console.log('Answer:', ans)
}
