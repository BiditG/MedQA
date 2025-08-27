const fs = require('fs')
const path = require('path')

function parseCsv(content) {
  const lines = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === '"') {
      inQuotes = !inQuotes
      cur += ch
    } else if (ch === '\n' && !inQuotes) {
      lines.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur) lines.push(cur)

  const rows = lines.map((line) => {
    const cols = []
    let cell = ''
    let q = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        q = !q
      } else if (ch === ',' && !q) {
        cols.push(cell)
        cell = ''
      } else {
        cell += ch
      }
    }
    cols.push(cell)
    return cols.map((c) => c.trim().replace(/^"|"$/g, ''))
  })

  return rows
}

;(async () => {
  const csvPath = path.join(process.cwd(), 'public', 'data', 'pathogenesis.csv')
  const raw = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCsv(raw)
  const header = rows[0].map((h) => h.toLowerCase())
  const diseaseIdx = header.indexOf('disease')
  const pathIdx = header.indexOf('pathogenesis')
  const sourceIdx = header.indexOf('source')
  const topic = 'Tuberculosis'
  let found = null
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i]
    const name = (cols[diseaseIdx] || '').toLowerCase()
    if (name === topic.toLowerCase()) {
      const rawPath = cols[pathIdx] || ''
      const steps = rawPath
        .split(/→|->|\u2192|\u2013|\|/)
        .map((s) => s.replace(/^\d+\.?\s*/, '').trim())
        .filter(Boolean)
      let mermaid = `graph TD\n`
      steps.forEach((s, idx) => {
        const nodeId = `S${idx}`
        mermaid += `${nodeId}[${s.replace(/\]/g, '')}]`
        if (idx < steps.length - 1) mermaid += ` --> S${idx + 1}`
        mermaid += `\n`
      })
      found = { title: topic, steps, mermaid, source: cols[sourceIdx] || '' }
      break
    }
  }
  console.log(JSON.stringify(found, null, 2))
})()
