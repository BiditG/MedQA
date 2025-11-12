const fs = require('fs')
const path = require('path')

const inFile = path.join(__dirname, '..', 'public', 'data', 'bio.converted.csv')
const outFile = path.join(
  __dirname,
  '..',
  'public',
  'data',
  'bio.converted.no-cockroach.csv',
)

if (!fs.existsSync(inFile)) {
  console.error('Input file not found:', inFile)
  process.exit(1)
}

let t = fs.readFileSync(inFile, 'utf8')
if (t.charCodeAt(0) === 0xfeff) t = t.slice(1)
const lines = t.split(/\r?\n/)
if (lines.length === 0) {
  console.error('Empty input')
  process.exit(1)
}
const header = lines.shift()
let total = 0,
  kept = 0,
  removed = 0
const out = [header]
for (const line of lines) {
  if (!line || !line.trim()) continue
  total++
  // extract question field - it's the 5th column; but fields may contain commas, so better parse by CSV quoting
  // We'll use a simple state machine to get the first 5 fields
  let fields = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // check escaped quote
      if (inQuote && i + 1 < line.length && line[i + 1] === '"') {
        cur += '"'
        i++ // skip next
      } else {
        inQuote = !inQuote
      }
    } else if (ch === ',' && !inQuote) {
      fields.push(cur)
      cur = ''
    } else {
      cur += ch
    }
    if (fields.length >= 10 && !inQuote) {
      // we've collected enough; append rest and break
    }
  }
  // push last
  fields.push(cur)

  const question = (fields[4] || '').replace(/^"|"$/g, '').toLowerCase()
  if (question.includes('cockroach')) {
    removed++
    continue
  }
  out.push(line)
  kept++
}
fs.writeFileSync(outFile, out.join('\n') + '\n', 'utf8')
console.log(`Total=${total}`)
console.log(`Kept=${kept}`)
console.log(`Removed=${removed}`)
console.log(`Written=${outFile}`)
console.log('Preview (first 5 kept lines):')
console.log(out.slice(0, 6).join('\n'))
