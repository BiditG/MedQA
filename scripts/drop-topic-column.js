#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const filePath = path.resolve(
  __dirname,
  '..',
  'public',
  'data',
  'train.converted.csv',
)
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath)
  process.exit(2)
}

const data = fs.readFileSync(filePath, 'utf8')
const lines = data.split(/\r?\n/)

function parseCSVLine(line) {
  const fields = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  fields.push(cur)
  return fields
}

function serializeCSVLine(fields) {
  return fields
    .map((f) => {
      if (f == null) f = ''
      const s = String(f)
      const mustQuote = /[",\n\r]/.test(s)
      if (mustQuote) {
        return '"' + s.replace(/"/g, '""') + '"'
      }
      return s
    })
    .join(',')
}

// backup
const now = new Date().toISOString().replace(/[:]/g, '-')
const backupPath = filePath + '.' + now + '.bak'
fs.copyFileSync(filePath, backupPath)
console.log('Backup written to', backupPath)

if (lines.length === 0) {
  console.error('Empty file')
  process.exit(3)
}

const header = lines[0]
const headerFields = parseCSVLine(header).map((h) => h.trim())
const topicIdx = headerFields.map((h) => h.toLowerCase()).indexOf('topic')
if (topicIdx === -1) {
  console.error('Header has no "topic" column; nothing to drop.')
  process.exit(4)
}

// build new header without topic
const newHeaderFields = headerFields
  .slice(0, topicIdx)
  .concat(headerFields.slice(topicIdx + 1))
const outLines = [serializeCSVLine(newHeaderFields)]

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line || !line.trim()) {
    // preserve empty line
    outLines.push(line)
    continue
  }
  const fields = parseCSVLine(line)
  // pad if needed
  while (fields.length < headerFields.length) fields.push('')
  const newFields = fields.slice(0, topicIdx).concat(fields.slice(topicIdx + 1))
  outLines.push(serializeCSVLine(newFields))
}

fs.writeFileSync(filePath, outLines.join('\n'), 'utf8')
console.log('Wrote updated CSV without topic column to', filePath)
process.exit(0)
