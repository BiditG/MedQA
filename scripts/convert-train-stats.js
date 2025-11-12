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
      if (ch === '\r' && text[i + 1] === '\n') continue
      row.push(cur)
      cur = ''
      rows.push(row)
      row = []
    } else {
      cur += ch
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function countField(rows, colIndex) {
  const counts = new Map()
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row) continue
    const val = (row[colIndex] || '').trim()
    const key = val || '(empty)'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return counts
}

function topN(map, n = 20) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

function main() {
  const argv = process.argv.slice(2)
  const input =
    argv[0] || path.join(process.cwd(), 'public', 'data', 'train.converted.csv')
  if (!fs.existsSync(input)) {
    console.error('Input not found:', input)
    process.exit(2)
  }
  const text = fs.readFileSync(input, 'utf8')
  const rows = parseCSV(text)
  if (!rows || rows.length === 0) {
    console.error('No rows')
    process.exit(3)
  }
  // header -> find indexes
  const header = rows[0].map((h) => (h || '').trim().toLowerCase())
  const idx = (name) => header.indexOf(name)
  const subjI = idx('subject')
  const chapI = idx('chapter')
  const topI = idx('topic')

  const subjCounts = countField(rows, subjI)
  const chapCounts = countField(rows, chapI)
  const topCounts = countField(rows, topI)

  const summary = {
    totalRows: rows.length - 1,
    subjectsTop: topN(subjCounts, 50),
    chaptersTop: topN(chapCounts, 50),
    topicsTop: topN(topCounts, 50),
  }

  const outPath = path.join(
    process.cwd(),
    'public',
    'data',
    'train.converted.stats.json',
  )
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8')
  console.log('Wrote stats to', outPath)
  console.log('Total rows:', summary.totalRows)
  console.log('\nTop subjects:')
  summary.subjectsTop.slice(0, 20).forEach(([k, v]) => console.log(k, v))
  console.log('\nTop chapters:')
  summary.chaptersTop.slice(0, 20).forEach(([k, v]) => console.log(k, v))
  console.log('\nTop topics:')
  summary.topicsTop.slice(0, 20).forEach(([k, v]) => console.log(k, v))
}

if (require.main === module) main()
