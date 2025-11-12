const fs = require('fs')
const path = require('path')

if (process.argv.length < 3) {
  console.error('Usage: node normalize-csv.js <relative-path-to-csv>')
  process.exit(1)
}

const rel = process.argv[2]
const infile = path.isAbsolute(rel) ? rel : path.join(__dirname, '..', rel)
if (!fs.existsSync(infile)) {
  console.error('File not found:', infile)
  process.exit(2)
}
const backup = infile + '.bak'
const outfile = infile // overwrite

function splitCSVLine(line) {
  const res = []
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
      res.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  res.push(cur)
  return res
}

try {
  const raw = fs.readFileSync(infile, 'utf8')
  fs.writeFileSync(backup, raw, 'utf8')
  console.log('Backup written to', backup)

  const lines = raw.split(/\r?\n/)
  let currentExam = ''
  let outLines = []
  let seenHeader = false
  let idCounter = 1
  let headerCols = null

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    if (!rawLine || rawLine.trim() === '') continue
    const trimmed = rawLine.trim()

    if (trimmed.startsWith('#')) {
      // treat entire stripped text as exam marker (strip leading # and non-alphanum)
      currentExam = trimmed.replace(/^#+/, '').trim()
      continue
    }

    // detect header row: common cases: starts with id,subject
    const low = trimmed.toLowerCase()
    if (
      !seenHeader &&
      (low.startsWith('id,') ||
        low.startsWith('"id') ||
        (low.includes('question') &&
          (low.includes('option') || low.includes('answer'))))
    ) {
      headerCols = splitCSVLine(rawLine).map((c) => c.trim())
      // ensure the first col label is 'id'
      headerCols[0] = 'id'
      // add exam column (if not present)
      if (!headerCols.includes('exam')) headerCols.push('exam')
      outLines.push(
        headerCols
          .map((c) =>
            c.includes(',') || c.includes(' ') || c.includes('"')
              ? '"' + c.replace(/"/g, '""') + '"'
              : c,
          )
          .join(','),
      )
      seenHeader = true
      continue
    }

    // data row
    const cols = splitCSVLine(rawLine)

    if (!seenHeader) {
      // create a default header based on number of columns (old id plus others)
      const guess = [
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
      ]
      headerCols = guess.slice(0, Math.max(guess.length, cols.length))
      headerCols[0] = 'id'
      if (!headerCols.includes('exam')) headerCols.push('exam')
      outLines.push(headerCols.join(','))
      seenHeader = true
    }

    // Remove first column (existing id) and replace with numeric id
    const dataCols = cols.slice(1)
    const newRow = []
    newRow.push(String(idCounter))
    for (let j = 0; j < dataCols.length; j++) {
      let cell = dataCols[j]
      if (cell === undefined) cell = ''
      if (cell.includes('"')) cell = cell.replace(/"/g, '""')
      if (
        cell.includes(',') ||
        cell.includes('"') ||
        cell.includes('\n') ||
        /^\s|\s$/.test(cell)
      ) {
        cell = '"' + cell + '"'
      }
      newRow.push(cell)
    }
    // append exam
    const examVal = currentExam || ''
    const examCell = '"' + examVal.replace(/"/g, '""') + '"'
    newRow.push(examCell)

    outLines.push(newRow.join(','))
    idCounter++
  }

  fs.writeFileSync(outfile, outLines.join('\n'), 'utf8')
  console.log(
    'Wrote',
    idCounter - 1,
    'rows to',
    outfile,
    'with ids starting at 1 and exam column.',
  )
} catch (err) {
  console.error('Error:', err)
  process.exit(1)
}
