const fs = require('fs')
const path = require('path')

if (process.argv.length < 3) {
  console.error('Usage: node renumber-csv-ids.js <relative-path-to-csv>')
  process.exit(1)
}

const rel = process.argv[2]
const infile = path.isAbsolute(rel) ? rel : path.join(__dirname, '..', rel)
if (!fs.existsSync(infile)) {
  console.error('File not found:', infile)
  process.exit(2)
}
const backup = infile + '.bak.ids'

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
  const out = []
  let headerWritten = false
  let idCounter = 1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || line.trim() === '') continue
    const trimmed = line.trim()
    if (trimmed.startsWith('#')) {
      // keep comment lines as-is
      out.push(line)
      continue
    }
    // detect header: likely contains 'subject' and 'question' or starts with 'id,'
    if (
      !headerWritten &&
      (trimmed.toLowerCase().startsWith('id,') ||
        (trimmed.toLowerCase().includes('question') &&
          trimmed.toLowerCase().includes('subject')))
    ) {
      // normalize first column label to 'id'
      const cols = splitCSVLine(line).map((c) => c.trim())
      cols[0] = 'id'
      out.push(
        cols
          .map((c) =>
            c.includes(',') || c.includes('"') || c.includes(' ')
              ? '"' + c.replace(/"/g, '""') + '"'
              : c,
          )
          .join(','),
      )
      headerWritten = true
      continue
    }

    if (!headerWritten) {
      // no header detected yet, assume first data row is data; write a synthetic header? Safer to not write header and just renumber rows.
      headerWritten = true // still proceed
    }

    const cols = splitCSVLine(line)
    // remove first column (old id) and prepend new numeric id
    const rest = cols.slice(1)
    const newCols = [String(idCounter), ...rest]
    // escape and join
    const escaped = newCols.map((cell) => {
      if (cell === undefined) cell = ''
      if (cell.includes('"')) cell = cell.replace(/"/g, '""')
      if (cell.includes(',') || cell.includes('"') || /^\s|\s$/.test(cell)) {
        return '"' + cell + '"'
      }
      return cell
    })
    out.push(escaped.join(','))
    idCounter++
  }

  fs.writeFileSync(infile, out.join('\n'), 'utf8')
  console.log(
    'Wrote',
    idCounter - 1,
    'rows to',
    infile,
    'with numeric ids starting at 1.',
  )
} catch (err) {
  console.error('Error:', err)
  process.exit(1)
}
