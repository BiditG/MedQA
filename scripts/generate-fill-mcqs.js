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
  if (
    str.includes('"') ||
    str.includes(',') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

const csvPath = path.resolve(__dirname, '..', 'public', 'data', 'ceemcq.csv')
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found at', csvPath)
  process.exit(1)
}

const raw = fs.readFileSync(csvPath, 'utf8')
const rows = parseCSV(raw)
if (!rows.length) {
  console.error('No rows')
  process.exit(1)
}
const header = rows[0].map((h) => h.trim())
const dataRows = rows.slice(1)

// find indices for relevant columns
const idx = {}
header.forEach((h, i) => (idx[h.toLowerCase()] = i))

function getCell(r, name) {
  const i = idx[name.toLowerCase()]
  return i === undefined ? '' : r[i] || ''
}

// group by topic
const topics = new Map()
for (const r of dataRows) {
  const topic = (getCell(r, 'topic') || '').trim() || 'Unspecified'
  const subj = (getCell(r, 'subject') || '').trim() || 'Unspecified'
  const key = `${subj}|||${topic}`
  if (!topics.has(key)) topics.set(key, { subject: subj, topic, rows: [] })
  topics.get(key).rows.push(r)
}

const MIN = 50
const generated = []
let genCount = 0

function sanitizeId(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

for (const [key, info] of topics.entries()) {
  const have = info.rows.length
  if (have >= MIN) continue
  const need = MIN - have
  const subj = info.subject
  const topic = info.topic
  const idBase = sanitizeId(subj + '_' + topic) || 'gen'
  for (let i = 0; i < need; i++) {
    genCount++
    const gid = `gen_${idBase}_${String(Date.now()).slice(-5)}_${genCount}`
    const qnum = have + i + 1
    const question = `Auto-generated placeholder Q${qnum} for topic ${topic} — replace with real content.`
    const optionA = 'Option A (placeholder)'
    const optionB = 'Option B (placeholder)'
    const optionC = 'Option C (placeholder)'
    const optionD = 'Option D (placeholder)'
    const answer = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
    const explanation =
      'Auto-generated placeholder question. Please replace with validated content.'
    const row = []
    for (const h of header) {
      const hl = h.toLowerCase()
      if (hl === 'id') row.push(gid)
      else if (hl === 'subject') row.push(subj)
      else if (hl === 'chapter') row.push('Generated')
      else if (hl === 'topic') row.push(topic)
      else if (hl === 'question') row.push(question)
      else if (hl === 'optiona') row.push(optionA)
      else if (hl === 'optionb') row.push(optionB)
      else if (hl === 'optionc') row.push(optionC)
      else if (hl === 'optiond') row.push(optionD)
      else if (hl === 'answer') row.push(answer)
      else if (hl === 'explanation') row.push(explanation)
      else row.push('')
    }
    generated.push(row)
  }
}

// write merged file
const outPath = path.resolve(
  __dirname,
  '..',
  'public',
  'data',
  'ceemcq.generated.csv',
)
const lines = []
lines.push(header.join(','))
for (const r of dataRows) {
  const line = r.map((c) => escapeCell(c)).join(',')
  lines.push(line)
}
for (const r of generated) {
  lines.push(r.map((c) => escapeCell(c)).join(','))
}
fs.writeFileSync(outPath, lines.join('\n'), 'utf8')

// print summary
console.log('Original questions:', dataRows.length)
console.log('Generated placeholder questions:', generated.length)
console.log('Output written to', outPath)

// print topics that were filled
for (const [key, info] of topics.entries()) {
  const have = info.rows.length
  if (have < MIN) {
    console.log(
      `Filled topic: subject='${info.subject}' topic='${info.topic}' had=${have} now=${MIN}`,
    )
  }
}
