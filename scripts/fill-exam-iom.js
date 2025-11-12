const fs = require('fs')
const path = require('path')

const infile = path.join(__dirname, '..', 'public', 'data', 'pastquestions.csv')
const backup = infile + '.bak.iom'

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
  let header = null
  let replaced = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line || line.trim() === '') continue
    if (!header) {
      // assume first non-empty line is header
      header = line
      out.push(header)
      continue
    }
    const cols = splitCSVLine(line)
    // last column should be exam per earlier script
    if (cols.length === 0) continue
    const lastIndex = cols.length - 1
    const exam = cols[lastIndex].trim()
    // consider empty if zero-length after trimming or equals ""
    const unquoted =
      exam.startsWith('"') && exam.endsWith('"')
        ? exam.slice(1, -1).trim()
        : exam
    if (!unquoted) {
      cols[lastIndex] = '"IOM"'
      replaced++
    }
    // re-escape any internal quotes
    const escaped = cols.map((cell) => {
      if (cell === undefined) cell = ''
      // if cell already appears quoted, keep as-is
      if (cell.startsWith('"') || (cell.startsWith('"') && cell.endsWith('"')))
        return cell
      if (cell.includes('"')) cell = cell.replace(/"/g, '""')
      if (cell.includes(',') || cell.includes('"') || /^\s|\s$/.test(cell))
        return '"' + cell + '"'
      return cell
    })
    out.push(escaped.join(','))
  }

  fs.writeFileSync(infile, out.join('\n'), 'utf8')
  console.log(
    'Wrote',
    out.length - 1,
    'data rows. Replaced',
    replaced,
    'blank exam values with IOM.',
  )
} catch (err) {
  console.error('Error:', err)
  process.exit(1)
}
