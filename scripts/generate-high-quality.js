#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

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
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else cur += ch
  }
  if (cur !== '' || row.length) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function escapeCell(s) {
  if (s === undefined || s === null) return ''
  const str = String(s)
  if (str.includes('"') || str.includes(',') || str.includes('\n'))
    return '"' + str.replace(/"/g, '""') + '"'
  return str
}

const dataDir = path.resolve(__dirname, '..', 'public', 'data')
const filledPath = path.join(dataDir, 'ceemcq.filled.csv')
if (!fs.existsSync(filledPath)) {
  console.error('Filled CSV not found:', filledPath)
  process.exit(1)
}
const raw = fs.readFileSync(filledPath, 'utf8')
const rows = parseCSV(raw)
if (!rows.length) {
  console.error('Empty')
  process.exit(1)
}
const header = rows[0].map((h) => h.trim())
const data = rows.slice(1)

function getCell(row, name) {
  const i = header.findIndex((h) => h.toLowerCase() === name.toLowerCase())
  return i >= 0 ? row[i] || '' : ''
}

// compute topic frequencies
const freq = {}
for (const r of data) {
  const topic = (getCell(r, 'topic') || '').toString().trim() || 'Unspecified'
  freq[topic] = (freq[topic] || 0) + 1
}
const topicsSorted = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .map(([t]) => t)

const TOP_N = 10
const PER_TOPIC = 5
const chosenTopics = topicsSorted.slice(0, TOP_N)

function sanitize(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// higher-quality templates — conservative and reviewable
function makeHQQuestion(subject, topic, idx) {
  const t = topic || subject || 'General'
  // pick some templates that require understanding
  const templates = []
  templates.push(() => ({
    question: `A student measures the quantity related to ${t} under two different conditions and finds a consistent change. Which explanation best accounts for this observation?`,
    options: [
      `A direct proportional relationship predicted by the governing principle of ${t}.`,
      `An experimental artifact unrelated to ${t}.`,
      `A random fluctuation due to measurement error.`,
      `A secondary effect that contradicts the main theory of ${t}.`,
    ],
    answer: 'A',
    explanation: `The most conservative explanation is the direct proportional relationship, but verify experimental setup — this question is conceptual and tests interpretation of results in ${t}.`,
  }))

  templates.push(() => ({
    question: `Which of the following best explains how ${t} affects system behaviour in standard conditions?`,
    options: [
      `It increases linearly and dominates at all scales.`,
      `It influences the system but is limited by boundary conditions, so its effect is context-dependent.`,
      `It has no measurable effect under normal conditions.`,
      `It reverses sign when temperature is reduced.`,
    ],
    answer: 'B',
    explanation: `Many ${t}-related phenomena are context-dependent; this tests understanding of limiting conditions.`,
  }))

  templates.push(() => ({
    question: `Consider a standard example problem in ${t}. Which assumption below is essential to derive the typical result?`,
    options: [
      `Neglecting secondary interactions because they are small compared to the primary effect.`,
      `Assuming the system is at absolute zero.`,
      `Assuming infinite time for equilibration in all cases.`,
      `Assuming a non-physical boundary condition.`,
    ],
    answer: 'A',
    explanation: `Identifying which assumptions are used in derivations is a key understanding skill.`,
  }))

  templates.push(() => ({
    question: `Which experimental modification would most directly test the role of ${t} in the observed phenomenon?`,
    options: [
      `Vary the primary variable linked to ${t} while keeping others constant.`,
      `Change an unrelated parameter and observe no change.`,
      `Remove measurements entirely.`,
      `Introduce multiple uncontrolled variables simultaneously.`,
    ],
    answer: 'A',
    explanation: `Direct manipulation of the variable of interest is the standard method to test causality.`,
  }))

  templates.push(() => ({
    question: `A conceptual trap in ${t} is to assume which of the following?`,
    options: [
      `That correlation implies causation.`,
      `That conservation laws always fail.`,
      `That all real systems are linear.`,
      `That measurements are always exact without uncertainty.`,
    ],
    answer: 'A',
    explanation: `This tests the student's ability to avoid common reasoning errors.`,
  }))

  // pick template deterministically
  const pick = templates[(idx + sanitize(topic).length) % templates.length]
  const q = pick()
  const id = `hq_${sanitize(topic)}_${idx}`
  return {
    id,
    subject,
    chapter: 'HQ-Generated',
    topic,
    question: q.question,
    optionA: q.options[0],
    optionB: q.options[1],
    optionC: q.options[2],
    optionD: q.options[3],
    answer: q.answer,
    explanation: q.explanation,
  }
}

// build HQ rows
const hqRows = []
for (let ti = 0; ti < chosenTopics.length; ti++) {
  const topic = chosenTopics[ti]
  // infer subject by scanning existing data for first matching row
  const sampleRow = data.find(
    (r) => (getCell(r, 'topic') || '').toString().trim() === topic,
  )
  const subject = sampleRow
    ? getCell(sampleRow, 'subject') || 'General'
    : 'General'
  for (let j = 0; j < PER_TOPIC; j++) {
    const q = makeHQQuestion(subject, topic, ti * PER_TOPIC + j)
    hqRows.push(q)
  }
}

// write HQ-only CSV
const outHQOnly = [header.join(',')]
for (const r of hqRows) {
  const row = header.map((h) => {
    const hl = h.toLowerCase()
    if (hl === 'id') return r.id
    if (hl === 'subject') return r.subject
    if (hl === 'chapter') return r.chapter
    if (hl === 'topic') return r.topic
    if (hl === 'question') return r.question
    if (hl === 'optiona') return r.optionA
    if (hl === 'optionb') return r.optionB
    if (hl === 'optionc') return r.optionC
    if (hl === 'optiond') return r.optionD
    if (hl === 'answer') return r.answer
    if (hl === 'explanation') return r.explanation
    return ''
  })
  outHQOnly.push(row.map((c) => escapeCell(c)).join(','))
}

const outHQPath = path.join(dataDir, 'ceemcq.hq-only.csv')
fs.writeFileSync(outHQPath, outHQOnly.join('\n'), 'utf8')
console.log('Wrote HQ-only CSV:', outHQPath)
console.log(
  'Topics generated:',
  chosenTopics.length,
  'Questions total:',
  hqRows.length,
)

// also write merged review file appended to filled CSV (but keep original filled intact by writing a new merged file)
const mergedPath = path.join(dataDir, 'ceemcq.with-hq.csv')
const mergedLines = [header.join(',')]
for (const r of data) mergedLines.push(r.map((c) => escapeCell(c)).join(','))
for (const r of hqRows)
  mergedLines.push(
    header
      .map((h) => {
        const hl = h.toLowerCase()
        if (hl === 'id') return r.id
        if (hl === 'subject') return r.subject
        if (hl === 'chapter') return r.chapter
        if (hl === 'topic') return r.topic
        if (hl === 'question') return r.question
        if (hl === 'optiona') return r.optionA
        if (hl === 'optionb') return r.optionB
        if (hl === 'optionc') return r.optionC
        if (hl === 'optiond') return r.optionD
        if (hl === 'answer') return r.answer
        if (hl === 'explanation') return r.explanation
        return ''
      })
      .map((c) => escapeCell(c))
      .join(','),
  )
fs.writeFileSync(mergedPath, mergedLines.join('\n'), 'utf8')
console.log('Wrote merged review CSV:', mergedPath)

// print first 10 HQ questions for quick review
for (let i = 0; i < Math.min(10, hqRows.length); i++) {
  const q = hqRows[i]
  console.log('\nHQ', i + 1, q.id, q.subject, q.topic)
  console.log('Q:', q.question)
  console.log('A)', q.optionA)
  console.log('B)', q.optionB)
  console.log('C)', q.optionC)
  console.log('D)', q.optionD)
  console.log('Answer:', q.answer)
  console.log('Explanation:', q.explanation)
}
