const fs = require('fs')
const path = require('path')

function levenshtein(a, b) {
  if (a === b) return 0
  const al = a.length
  const bl = b.length
  if (al === 0) return bl
  if (bl === 0) return al
  const dp = Array(al + 1)
    .fill(null)
    .map(() => Array(bl + 1).fill(0))
  for (let i = 0; i <= al; i++) dp[i][0] = i
  for (let j = 0; j <= bl; j++) dp[0][j] = j
  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      )
    }
  }
  return dp[al][bl]
}

function normalizeTopic(s) {
  return (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/\s+/g, ' ')
}

const csvPath = path.join(__dirname, '..', 'public', 'data', 'ceemcq.csv')
if (!fs.existsSync(csvPath)) {
  console.error('CSV not found at', csvPath)
  process.exit(1)
}

const text = fs.readFileSync(csvPath, 'utf8')
const lines = text.split(/\r?\n/)
const header = lines[0].split(',').map((h) => h.trim())
const topicIdx = header.findIndex((h) => /topic/i.test(h))
if (topicIdx === -1) {
  console.error('No topic column found in header:', header)
  process.exit(1)
}

const topics = new Map()
for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line) continue
  // naive CSV split (good enough for this analysis)
  const cols = line.split(',')
  const raw = (cols[topicIdx] || '').trim()
  if (!raw) continue
  const key = normalizeTopic(raw)
  const v = topics.get(raw) || { raw, norm: key, count: 0 }
  v.count++
  topics.set(raw, v)
}

const topicList = Array.from(topics.values()).sort((a, b) => b.count - a.count)

// compute similarity graph
const n = topicList.length
const pairs = []
for (let i = 0; i < n; i++) {
  for (let j = i + 1; j < n; j++) {
    const a = topicList[i]
    const b = topicList[j]
    const na = a.norm
    const nb = b.norm
    if (na === nb) {
      pairs.push([a.raw, b.raw, 0, 'norm-eq'])
      continue
    }
    const dist = levenshtein(na, nb)
    const maxl = Math.max(na.length, nb.length) || 1
    const ratio = dist / maxl
    // heuristics: small edit distance, substring relation, long common prefix
    const commonPrefixLen = (() => {
      let k = 0
      while (k < na.length && k < nb.length && na[k] === nb[k]) k++
      return k
    })()
    if (
      ratio <= 0.22 ||
      dist <= 2 ||
      na.includes(nb) ||
      nb.includes(na) ||
      commonPrefixLen >= 6
    ) {
      pairs.push([
        a.raw,
        b.raw,
        dist,
        `ratio=${ratio.toFixed(2)} prefix=${commonPrefixLen}`,
      ])
    }
  }
}

// union-find to make clusters
const idxOf = new Map(topicList.map((t, i) => [t.raw, i]))
const parent = Array(topicList.length)
  .fill(0)
  .map((_, i) => i)
function find(x) {
  return parent[x] === x ? x : (parent[x] = find(parent[x]))
}
function union(a, b) {
  const ra = find(a)
  const rb = find(b)
  if (ra !== rb) parent[rb] = ra
}
for (const p of pairs) {
  const [r1, r2] = p
  union(idxOf.get(r1), idxOf.get(r2))
}

const clusters = {}
for (let i = 0; i < topicList.length; i++) {
  const r = find(i)
  clusters[r] = clusters[r] || []
  clusters[r].push(topicList[i])
}

const result = []
for (const k of Object.keys(clusters)) {
  const group = clusters[k]
  if (group.length <= 1) continue
  // pick canonical = most frequent, normalized nicer form
  group.sort((a, b) => b.count - a.count)
  const canonical = group[0].raw
  result.push({
    canonical,
    group: group.map((g) => ({ raw: g.raw, count: g.count })),
  })
}

if (result.length === 0) {
  console.log('No similar topics detected.')
  process.exit(0)
}

console.log('Suggested topic clusters to merge:')
for (const r of result) {
  console.log('\nCanonical:', r.canonical)
  for (const g of r.group) console.log(`  - ${g.raw} (count=${g.count})`)
}

// print summary counts for top topics
console.log('\nTop topics by frequency:')
topicList.slice(0, 80).forEach((t) => console.log(`${t.raw} — ${t.count}`))

// optional: write mapping file for manual review
const mapping = {}
for (const r of result) {
  for (const g of r.group) {
    if (g.raw !== r.canonical) mapping[g.raw] = r.canonical
  }
}
fs.writeFileSync(
  path.join(__dirname, '..', 'scripts', 'topic-mapping-suggestion.json'),
  JSON.stringify(mapping, null, 2),
)
console.log(
  '\nWrote mapping suggestion to scripts/topic-mapping-suggestion.json',
)

// done
