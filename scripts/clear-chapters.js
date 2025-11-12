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
        // escaped quote
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
      const mustQuote = /[",\n\r]/.test(f)
      if (mustQuote) {
        return '"' + String(f).replace(/"/g, '""') + '"'
      }
      return String(f)
    })
    .join(',')
}

// backup
const now = new Date().toISOString().replace(/[:]/g, '-')
const backupPath = filePath + '.' + now + '.bak'
fs.copyFileSync(filePath, backupPath)
console.log('Backup written to', backupPath)

// process
const outLines = []
if (lines.length === 0) {
  console.error('Empty file')
  process.exit(3)
}

// preserve header, but detect header columns to find which index is 'chapter'
const header = lines[0]
const headerFields = parseCSVLine(header).map((h) => h.trim().toLowerCase())
const chapterIdx = headerFields.indexOf('chapter')
if (chapterIdx === -1) {
  console.error(
    'No header column named "chapter" found. Header fields:',
    headerFields,
  )
  process.exit(4)
}
outLines.push(header)

for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line || !line.trim()) {
    // preserve empty lines as-is
    outLines.push(line)
    continue
  }
  const fields = parseCSVLine(line)
  // if the line has fewer fields than header, pad
  while (fields.length < headerFields.length) fields.push('')
  // clear chapter
  fields[chapterIdx] = ''
  outLines.push(serializeCSVLine(fields))
}

fs.writeFileSync(filePath, outLines.join('\n'), 'utf8')
console.log('Updated file written to', filePath)

process.exit(0)
