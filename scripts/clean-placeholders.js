#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const dataDir = path.resolve(__dirname, '..', 'public', 'data')
const filePath = path.join(dataDir, 'ceemcq.csv')
if (!fs.existsSync(filePath)) {
  console.error('ceemcq.csv not found at', filePath)
  process.exit(1)
}
const raw = fs.readFileSync(filePath, 'utf8')

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

const rows = parseCSV(raw)
if (!rows.length) {
  console.error('Empty CSV')
  process.exit(1)
}
const header = rows[0]
const data = rows.slice(1)

const total = data.length

const isPlaceholderRow = (row) => {
  const id = (row[0] || '').toString().trim()
  const chapter = (row[2] || '').toString().trim().toLowerCase()
  const question = (row[4] || '').toString()
  const explanation = (row[10] || '').toString()
  const optionsConcat = (
    (row[5] || '') +
    ' ' +
    (row[6] || '') +
    ' ' +
    (row[7] || '') +
    ' ' +
    (row[8] || '')
  ).toLowerCase()

  if (!id) return false
  if (/^(gen_|auto_real_|hq_)/i.test(id)) return true
  if (chapter === 'generated') return true
  if (
    /placeholder|auto-?generated|please replace|replace with real/i.test(
      question,
    )
  )
    return true
  if (/placeholder|please replace|auto-?generated/i.test(explanation))
    return true
  if (
    optionsConcat.includes('(placeholder)') ||
    optionsConcat.includes('placeholder')
  )
    return true
  return false
}

const kept = []
const removed = []
for (const r of data) {
  if (isPlaceholderRow(r)) removed.push(r)
  else kept.push(r)
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '')
const backupPath = path.join(dataDir, `ceemcq.csv.bak.${timestamp}`)
fs.copyFileSync(filePath, backupPath)
console.log('Backup written to', backupPath)

// write cleaned CSV (header + kept)
const outLines = [header.map((c) => escapeCell(c)).join(',')]
for (const r of kept) outLines.push(r.map((c) => escapeCell(c)).join(','))
fs.writeFileSync(filePath, outLines.join('\n'), 'utf8')

console.log('Total rows before:', total)
console.log('Rows removed:', removed.length)
console.log('Rows kept:', kept.length)
console.log('Cleaned ceemcq.csv written:', filePath)

// write a small report of removed ids for review
const reportPath = path.join(dataDir, 'ceemcq.removed-ids.txt')
const removedIds = removed.map((r) => r[0] || '').filter(Boolean)
fs.writeFileSync(reportPath, removedIds.join('\n'), 'utf8')
console.log('Removed IDs written to', reportPath)
