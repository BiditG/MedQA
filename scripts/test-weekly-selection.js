const fs = require('fs')

function parseCSV(text) {
  const rows = []
  let cur = ''
  let row = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"'
        i++
      } else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      row.push(cur)
      cur = ''
      rows.push(row)
      row = []
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else cur += ch
  }
  if (cur !== '' || row.length) {
    row.push(cur)
    rows.push(row)
  }
  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim())
  const items = []
  for (let r = 1; r < rows.length; r++) {
    const rr = rows[r]
    if (rr.every((c) => c.trim() === '')) continue
    const obj = {}
    for (let c = 0; c < header.length; c++)
      obj[header[c] ?? `col${c}`] = (rr[c] ?? '').trim()
    items.push({
      id: obj.id ?? `${r}`,
      subject: obj.subject ?? '',
      chapter: obj.chapter ?? '',
      topic: obj.topic ?? '',
      question: obj.question ?? '',
      optionA: obj.optionA ?? obj.optiona ?? '',
      optionB: obj.optionB ?? obj.optionb ?? '',
      optionC: obj.optionC ?? obj.optionc ?? '',
      optionD: obj.optionD ?? obj.optiond ?? '',
      answer: (obj.answer ?? '').replace(/\s+/g, ''),
      explanation: obj.explanation ?? '',
    })
  }
  return items
}

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

const CSV = 'public/data/ceemcq.csv'
const raw = fs.readFileSync(CSV, 'utf8')
const items = parseCSV(raw)

const totalQuestions = 200

const real = items.filter((i) => {
  const id = (i.id || '').toString()
  const chapter = (i.chapter || '').toString().toLowerCase()
  const topic = (i.topic || '').toString().toLowerCase()
  const question = (i.question || '').toString().toLowerCase()
  if (id.startsWith('gen_')) return false
  if (chapter === 'generated' || topic === 'generated') return false
  if (question.includes('auto-generated placeholder')) return false
  return true
})

const weights = { life: 0.8, physics: 0.5, chemistry: 0.5, mat: 0.2 }
const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

const pools = {}
for (const it of real) {
  const s = (it.subject || '').toString().trim().toLowerCase() || 'unspecified'
  if (!pools[s]) pools[s] = []
  pools[s].push(it)
}

const lifeSubjects = ['biology', 'botany', 'zoology']
const matSubjects = ['mat', 'reasoning']

function takeFromPool(arr, n, takenIds) {
  const a = shuffle(arr.slice()).filter((x) => !takenIds.has(x.id))
  const sel = a.slice(0, Math.max(0, n))
  for (const q of sel) takenIds.add(q.id)
  return sel
}

const targets = {}
for (const k of Object.keys(weights))
  targets[k] = Math.round((weights[k] / totalWeight) * totalQuestions)

const taken = new Set()
const selected = []

const lifePool = []
for (const ls of lifeSubjects) if (pools[ls]) lifePool.push(...pools[ls])
if (lifePool.length > 0)
  selected.push(...takeFromPool(lifePool, targets.life, taken))
if (pools['physics'])
  selected.push(...takeFromPool(pools['physics'], targets.physics, taken))
if (pools['chemistry'])
  selected.push(...takeFromPool(pools['chemistry'], targets.chemistry, taken))
const matPool = []
for (const m of matSubjects) if (pools[m]) matPool.push(...pools[m])
if (matPool.length > 0)
  selected.push(...takeFromPool(matPool, targets.mat, taken))

const remainingNeeded = Math.max(0, totalQuestions - selected.length)
if (remainingNeeded > 0) {
  const remainingPool = shuffle(real.filter((q) => !taken.has(q.id)))
  const extra = remainingPool.slice(0, remainingNeeded)
  for (const q of extra) taken.add(q.id)
  selected.push(...extra)
}

let finalPool = selected
if (finalPool.length > totalQuestions)
  finalPool = shuffle(finalPool).slice(0, totalQuestions)
if (finalPool.length < totalQuestions) {
  const fallback = shuffle(real.length >= totalQuestions ? real : items).slice(
    0,
    Math.min(totalQuestions, real.length || items.length),
  )
  finalPool = fallback
}

console.log('Selected:', finalPool.length)
const bySubj = {}
for (const q of finalPool) {
  const s = q.subject || 'Unspecified'
  bySubj[s] = (bySubj[s] || 0) + 1
}
console.log('By subject:')
console.log(bySubj)

// Also print life/physics/chem/Mat counts
let lifeCount = 0
for (const q of finalPool) {
  const s = (q.subject || '').toString().toLowerCase()
  if (lifeSubjects.includes(s)) lifeCount++
}
console.log('Life group count:', lifeCount)
let physicsCount = finalPool.filter(
  (q) => (q.subject || '').toString().toLowerCase() === 'physics',
).length
let chemCount = finalPool.filter(
  (q) => (q.subject || '').toString().toLowerCase() === 'chemistry',
).length
let matCount = finalPool.filter((q) =>
  matSubjects.includes((q.subject || '').toString().toLowerCase()),
).length
console.log({ physicsCount, chemCount, matCount })
