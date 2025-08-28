#!/usr/bin/env node
/**
 * append-mcqs.js
 * Safe utility to append MCQs defined in a JSON file to public/data/ceemcq.csv
 * Usage: node scripts/append-mcqs.js ./scripts/new-mcqs.json
 * The JSON file should be an array of objects with keys matching CSV headers (subject,chapter,topic,question,optionA,optionB,optionC,optionD,answer,explanation[,id])
 */
const fs = require('fs')
const path = require('path')

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

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error(
      'Please provide a JSON file: node scripts/append-mcqs.js scripts/new-mcqs.json',
    )
    process.exit(1)
  }
  const jsonPath = path.resolve(arg)
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath)
    process.exit(1)
  }

  const csvPath = path.resolve(__dirname, '..', 'public', 'data', 'ceemcq.csv')
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found at', csvPath)
    process.exit(1)
  }

  const raw = fs.readFileSync(csvPath, 'utf8')
  const lines = raw.split(/\r?\n/)
  if (lines.length === 0) {
    console.error('CSV appears empty')
    process.exit(1)
  }
  const headerLine = lines[0]
  const headers = headerLine.split(',').map((h) => h.trim())

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
  if (!Array.isArray(data)) {
    console.error('JSON should be an array of MCQ objects')
    process.exit(1)
  }

  // Build rows
  const rows = []
  let nextIdBase = Date.now()
  for (let i = 0; i < data.length; i++) {
    const obj = data[i]
    const row = headers.map((h) => {
      // try common header normalization
      const key =
        Object.keys(obj).find((k) => k.toLowerCase() === h.toLowerCase()) || h
      if (key in obj) return escapeCell(obj[key])
      // if id missing, create one
      if (h.toLowerCase() === 'id')
        return escapeCell(obj.id ?? `gen-${nextIdBase + i}`)
      return ''
    })
    rows.push(row.join(','))
  }

  // Append with a newline before
  const out = '\n' + rows.join('\n') + '\n'
  fs.appendFileSync(csvPath, out, 'utf8')
  console.log(`Appended ${rows.length} rows to ${csvPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
