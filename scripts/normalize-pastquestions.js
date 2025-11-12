const fs = require('fs')
const path = require('path')

const infile = path.join(__dirname, '..', 'public', 'data', 'pastquestions.csv')
const backup = infile + '.bak'
const outfile = infile

function splitCSVLine(line) {
  const res = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // toggle when not escaped
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // escaped quote
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
  let headerCols = null
  let seenHeader = false
  let idCounter = 1

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i]
    if (!rawLine || rawLine.trim() === '') continue
    const trimmed = rawLine.trim()
    if (trimmed.startsWith('#')) {
      currentExam = trimmed.replace(/^#+/, '').trim()
      continue
    }

    // detect header lines (simple heuristic)
    const low = trimmed.toLowerCase()
    if (
      !seenHeader &&
      (low.startsWith('id,') ||
        low.startsWith('"id') ||
        (low.includes('question') && low.includes('option')))
    ) {
      // parse header
      headerCols = splitCSVLine(rawLine).map((c) => c.trim())
      // ensure first column is 'id'
      headerCols[0] = 'id'
      headerCols.push('exam')
      outLines.push(
        headerCols
          .map((c) => (c.includes(',') || c.includes(' ') ? '"' + c + '"' : c))
          .join(','),
      )
      seenHeader = true
      continue
    }

    // data line
    const cols = splitCSVLine(rawLine)
    // If there's no header yet, assume standard columns and create one based on number of fields
    if (!seenHeader) {
      // guess header from number of fields
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
      headerCols.push('exam')
      outLines.push(headerCols.join(','))
      seenHeader = true
    }

    // remove original id (first column) and replace
    // ensure cols length at least headerCols.length-1
    // keep remaining columns as-is
    const dataCols = cols.slice(1) // drop old id
    // Some rows may have missing leading id resulting in first element not being id; if there is no leading quote and first token looks like an id string like phy_..., we may need to detect, but we assume dropping first column is OK per instruction

    // Build new row: newId + rest of columns + exam
    const newRowCols = []
    newRowCols.push(String(idCounter))
    for (let j = 0; j < dataCols.length; j++) {
      // if the cell contains comma or quote, wrap in quotes and escape existing quotes
      let cell = dataCols[j]
      if (cell.includes('"')) cell = cell.replace(/"/g, '""')
      if (
        cell.includes(',') ||
        cell.includes('"') ||
        cell.includes('\n') ||
        /^\s|\s$/.test(cell)
      ) {
        cell = '"' + cell + '"'
      }
      newRowCols.push(cell)
    }
    // append exam column
    const examVal = currentExam || ''
    const examCell = examVal.includes('"')
      ? examVal.replace(/"/g, '""')
      : examVal
    newRowCols.push('"' + examCell + '"')

    outLines.push(newRowCols.join(','))
    idCounter++
  }

  fs.writeFileSync(outfile, outLines.join('\n'), 'utf8')
  console.log(
    'Wrote',
    outLines.length - (seenHeader ? 1 : 0),
    'rows to',
    outfile,
    'with ids starting at 1 and exam column.',
  )
} catch (err) {
  console.error('Error:', err)
  process.exit(1)
}
