#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Clean converter (safe, single-file). Use this instead of the older convert-train.js if it is corrupted.

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')
}

function parseCSV(text) {
  const rows = []
  let i = 0
  const len = text.length
  let cur = []
  let field = ''
  let inQuotes = false
  while (i < len) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < len && text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        field += ch
        i++
        continue
      }
    }
    if (ch === '"') {
      inQuotes = true
      i++
      continue
    }
    if (ch === ',') {
      cur.push(field)
      field = ''
      i++
      continue
    }
    if (ch === '\r') {
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
    field += ch
    i++
  }
  if (field !== '' || cur.length > 0) cur.push(field)
  if (cur.length > 0) rows.push(cur)
  return rows
}

function quoteIfNeeded(s) {
  if (s == null) return ''
  const str = String(s)
  if (/[,\n\"]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function buildRegexFromToken(token) {
  if (/^[A-Za-z0-9]+$/.test(token))
    return new RegExp('\\b' + escapeRegex(token) + '\\b', 'i')
  return new RegExp(escapeRegex(token), 'i')
}

function convertRows(rows) {
  if (!rows || rows.length === 0) return []
  const header = rows[0].map((h) => (h || '').trim().toLowerCase())
  const idx = (name) => header.indexOf(name)
  const qi = idx('question')
  const d3i = idx('distractor3')
  const d1i = idx('distractor1')
  const d2i = idx('distractor2')
  const ci = idx('correct_answer')
  const si = idx('support')

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

  const subjectKeywords = {
    Physics: {
      strong: [
        'm/s',
        'newton',
        'kg',
        'joule',
        'hz',
        'tesla',
        'volt',
        'ohm',
        'coulomb',
        'photon',
        'quantum',
        'magnetic',
        'lorentz',
        'maxwell',
        'faraday',
        'induction',
        'capacitor',
        'inductor',
        'resistor',
      ],
      medium: [
        'force',
        'velocity',
        'acceleration',
        'momentum',
        'energy',
        'power',
        'mechanics',
        'optics',
        'wave',
        'frequency',
        'circuit',
        'current',
        'voltage',
        'resistance',
        'magnetism',
      ],
      weak: ['field', 'flux', 'emf', 'induce', 'resonance', 'doppler'],
    },
    Chemistry: {
      strong: [
        'ph',
        'titration',
        'enthalpy',
        'entropy',
        'gibbs',
        'stoichiometry',
        'molarity',
        'equilibrium',
        'redox',
        'oxidation',
        'reduction',
        'anode',
        'cathode',
      ],
      medium: [
        'acid',
        'base',
        'buffer',
        'mole',
        'atom',
        'molecule',
        'bond',
        'functional group',
        'reaction',
        'catalyst',
        'rate',
        'spectroscopy',
      ],
      weak: ['compound', 'mixture', 'solvent', 'solute'],
    },
    Biology: {
      strong: [
        'mitosis',
        'meiosis',
        'dna',
        'rna',
        'transcription',
        'translation',
        'ribosome',
        'mitochondria',
        'chloroplast',
        'photosynthesis',
        'atp',
        'enzyme',
        'antigen',
        'antibody',
        'bacteria',
        'virus',
        'pathogen',
        'cell',
      ],
      medium: [
        'gene',
        'genetics',
        'mutation',
        'evolution',
        'ecology',
        'physiology',
        'anatomy',
        'organ',
        'tissue',
        'population',
      ],
      weak: ['organism', 'habitat', 'symbiosis', 'food chain'],
    },
  }

  const topicMap = [
    {
      keys: ['photosynth', 'chloroplast', 'light reaction', 'calvin'],
      topic: 'Photosynthesis',
    },
    {
      keys: ['mitosis', 'meiosis', 'cell division', 'chromosome', 'chromatid'],
      topic: 'Cell Division',
    },
    {
      keys: ['enzyme', 'catalyst', 'active site', 'substrate'],
      topic: 'Enzymes',
    },
    { keys: ['acid', 'ph', 'base', 'titration', 'buffer'], topic: 'Acid-Base' },
    {
      keys: ['ohm', 'resistan', 'current', 'voltage', 'circuit'],
      topic: 'Electricity',
    },
    {
      keys: [
        'mechanics',
        'force',
        'acceleration',
        'momentum',
        'work',
        'energy',
        'projectile',
      ],
      topic: 'Mechanics',
    },
    {
      keys: ['optics', 'lens', 'mirror', 'refraction', 'reflection'],
      topic: 'Optics',
    },
    {
      keys: ['magnet', 'lorentz', 'flux', 'faraday', 'magnetism'],
      topic: 'Magnetism',
    },
    {
      keys: ['genetics', 'mendel', 'chromosome', 'allele', 'trait'],
      topic: 'Genetics',
    },
    {
      keys: ['ecology', 'food chain', 'ecosystem', 'biodiversity'],
      topic: 'Ecology',
    },
  ]

  const chapterMap = [
    {
      keys: ['mechanics', 'force', 'momentum', 'work', 'energy', 'power'],
      chapter: 'Mechanics',
    },
    {
      keys: ['optics', 'lens', 'mirror', 'refraction', 'reflection'],
      chapter: 'Optics',
    },
    {
      keys: ['wave', 'sound', 'resonance', 'frequency'],
      chapter: 'Waves & Sound',
    },
    {
      keys: ['ohm', 'current', 'voltage', 'circuit', 'capacitor', 'inductor'],
      chapter: 'Electricity & Circuits',
    },
    {
      keys: ['acid', 'ph', 'base', 'titration', 'buffer'],
      chapter: 'Acids & Bases',
    },
    {
      keys: ['organic', 'alkane', 'alkene', 'functional group', 'aromatic'],
      chapter: 'Organic Chemistry',
    },
    { keys: ['genetics', 'mendel', 'dna', 'rna'], chapter: 'Genetics' },
    {
      keys: ['ecology', 'food chain', 'ecosystem', 'biodiversity'],
      chapter: 'Ecology',
    },
    {
      keys: [
        'cell',
        'mitosis',
        'meiosis',
        'organelle',
        'chloroplast',
        'mitochondria',
      ],
      chapter: 'Cell Biology',
    },
  ]

  function inferSubjectTopicChapter(text, optionTexts) {
    const t = (text || '').toLowerCase()
    const opts = (optionTexts || []).join('\n').toLowerCase()
    const hay = t + '\n' + opts

    const scores = {}
    for (const subj of Object.keys(subjectKeywords)) {
      let s = 0
      const map = subjectKeywords[subj]
      for (const k of map.strong) {
        const re = buildRegexFromToken(k)
        if (re.test(hay)) s += 3
      }
      for (const k of map.medium) {
        const re = buildRegexFromToken(k)
        if (re.test(hay)) s += 2
      }
      for (const k of map.weak) {
        const re = buildRegexFromToken(k)
        if (re.test(hay)) s += 1
      }
      if (subj === 'Physics') {
        const unitRe =
          /\b(\d+(\.\d+)?\s*(m\/s|m\/s\^2|m s\^-2|N|J|Hz|eV|V|A|ohm|Ω|T|kg|m))\b/i
        if (unitRe.test(hay)) s += 4
      }
      scores[subj] = s
    }

    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1])
    const best = entries[0] || ['', 0]
    const second = entries[1] || ['', 0]
    const bestName = best[0]
    const bestScore = best[1]
    const secondScore = second[1] || 0

    const assign =
      bestScore >= 4 && bestScore >= Math.ceil(secondScore * 1.5 + 0.001)
    const subject = assign ? bestName : ''

    let top = ''
    for (const entry of topicMap) {
      for (const k of entry.keys) {
        const re = buildRegexFromToken(k)
        if (re.test(hay)) {
          top = entry.topic
          break
        }
      }
      if (top) break
    }

    let chap = ''
    for (const entry of chapterMap) {
      for (const k of entry.keys) {
        const re = buildRegexFromToken(k)
        if (re.test(hay)) {
          chap = entry.chapter
          break
        }
      }
      if (chap) break
    }

    return { subject, topic: top, chapter: chap, scores }
  }

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue
    const question = (row[qi] || '').trim()
    if (!question) continue
    const d1 = (row[d1i] || '').trim()
    const d2 = (row[d2i] || '').trim()
    const d3 = (row[d3i] || '').trim()
    const corr = (row[ci] || '').trim()
    const support = (row[si] || '').trim()

    const options = [
      { text: d1, correct: false },
      { text: d2, correct: false },
      { text: d3, correct: false },
      { text: corr, correct: true },
    ]

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }

    const letters = ['A', 'B', 'C', 'D']
    let answerLetter = 'A'
    for (let i = 0; i < options.length; i++)
      if (options[i].correct) answerLetter = letters[i]

    const optTexts = options.map((o) => o.text)
    const inferred = inferSubjectTopicChapter(question, optTexts)

    const id = 'train_' + String(idn).padStart(6, '0')
    idn++

    out.push([
      id,
      inferred.subject || '',
      inferred.chapter || '',
      inferred.topic || '',
      question,
      options[0].text,
      options[1].text,
      options[2].text,
      options[3].text,
      answerLetter,
      support || '',
    ])
  }

  return out
}

function rowsToCSV(rows) {
  return rows.map((r) => r.map((c) => quoteIfNeeded(c)).join(',')).join('\n')
}

if (require.main === module) {
  const inPath =
    process.argv[2] || path.join(__dirname, '..', 'public', 'data', 'train.csv')
  const outPath =
    process.argv[3] ||
    path.join(__dirname, '..', 'public', 'data', 'train.converted.csv')
  const text = fs.readFileSync(inPath, 'utf8')
  const rows = parseCSV(text)
  const outRows = convertRows(rows)
  fs.writeFileSync(outPath, rowsToCSV(outRows), 'utf8')
  console.log('Wrote', outPath, 'rows=', outRows.length - 1)
}
