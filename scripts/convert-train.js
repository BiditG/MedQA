#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Minimal, safe CSV converter for train.csv -> train.converted.csv
function parseCSV(text) {
  const rows = []
  let i = 0
  const len = text.length
  let cur = []
  let field = ''
  let inQ = false
  while (i < len) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQ = false
        i++
        continue
      }
      field += ch
      i++
      continue
    }
    if (ch === '"') {
      inQ = true
      i++
      continue
    }
    if (ch === ',') {
      cur.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\n') {
      cur.push(field)
      rows.push(cur)
      cur = []
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
      i++
      continue
    }
    field += ch
    i++
  }
  if (field !== '' || cur.length > 0) cur.push(field)
  if (cur.length > 0) rows.push(cur)
  return rows
}

function quote(s) {
  if (s == null) return ''
  const str = String(s)
  if (/[,\n"]/g.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function toCSV(rows) {
  return rows.map((r) => r.map(quote).join(',')).join('\n') + '\n'
}

function main() {
  const inPath =
    process.argv[2] || path.join(__dirname, '..', 'public', 'data', 'train.csv')
  const outPath =
    process.argv[3] ||
    path.join(__dirname, '..', 'public', 'data', 'train.converted.csv')
  if (!fs.existsSync(inPath)) {
    console.error('Input not found:', inPath)
    process.exit(1)
  }
  const txt = fs.readFileSync(inPath, 'utf8')
  const rows = parseCSV(txt)
  if (!rows || rows.length === 0) {
    console.error('No rows')
    process.exit(1)
  }

  const header = rows[0].map((h) => (h || '').trim().toLowerCase())
  const idx = (name) => header.indexOf(name)
  const qi = idx('question')
  const d1 = idx('distractor1')
  const d2 = idx('distractor2')
  const d3 = idx('distractor3')
  const ca = idx('correct_answer')
  const sup = idx('support')

  const out = []
  out.push([
    'id',
    'subject',
    'chapter',
    'topic',
    'question',
    'optionA',
    'optionB',
    'optionC',
    'optionD',
    'answer',
    'explanation',
  ])
  let idn = 1
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const question = (row[qi] || '').trim()
    if (!question) continue
    const opts = [
      (row[d1] || '').trim(),
      (row[d2] || '').trim(),
      (row[d3] || '').trim(),
      (row[ca] || '').trim(),
    ]
    shuffle(opts)
    const letters = ['A', 'B', 'C', 'D']
    const answerIndex = opts.findIndex((x) => x === (row[ca] || '').trim())
    const answer = answerIndex >= 0 ? letters[answerIndex] : 'A'
    const supportText = (row[sup] || '').trim()
    const id = 'train_' + String(idn++).padStart(6, '0')
    out.push([
      id,
      '',
      '',
      '',
      question,
      opts[0],
      opts[1],
      opts[2],
      opts[3],
      answer,
      supportText,
    ])
  }

  fs.writeFileSync(outPath, toCSV(out), 'utf8')
  console.log('Wrote', outPath, 'rows=', out.length - 1)
}

if (require.main === module) main()
