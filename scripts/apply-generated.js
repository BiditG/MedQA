const fs = require('fs')
const path = require('path')

const dataDir = path.resolve(__dirname, '..', 'public', 'data')
const origPath = path.join(dataDir, 'ceemcq.csv')
const genPath = path.join(dataDir, 'ceemcq.generated.csv')

if (!fs.existsSync(genPath)) {
  console.error('Generated file not found at', genPath)
  process.exit(1)
}
if (!fs.existsSync(origPath)) {
  console.error('Original file not found at', origPath)
  process.exit(1)
}

const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)
const backupPath = path.join(dataDir, `ceemcq.csv.bak.${ts}`)
fs.copyFileSync(origPath, backupPath)
fs.copyFileSync(genPath, origPath)

const origLines = fs.readFileSync(backupPath, 'utf8').split(/\r?\n/).length
const newLines = fs.readFileSync(origPath, 'utf8').split(/\r?\n/).length
const appended = newLines - origLines

console.log('Backup file:', backupPath)
console.log('Backup lines:', origLines)
console.log('New file lines:', newLines)
console.log('Generated appended:', appended)

// print up to 10 generated sample lines (lines starting with gen_)
const stream = fs.readFileSync(origPath, 'utf8')
const sample = []
for (const line of stream.split(/\r?\n/)) {
  if (!line) continue
  if (line.startsWith('gen_')) {
    sample.push(line)
    if (sample.length >= 10) break
  }
}
if (sample.length) {
  console.log('\nSample generated rows (up to 10):')
  sample.forEach((l) => console.log(l))
} else {
  console.log('\nNo generated rows found prefixed with gen_ in the new CSV.')
}

console.log('\nDone.')
