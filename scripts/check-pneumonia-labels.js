const fs = require('fs')
const path = require('path')

function inferLabel(rel, name) {
  const parent = (rel.split(path.sep).filter(Boolean).pop() || '').toLowerCase()
  const fname = name.toLowerCase()
  const pneumoniaRe =
    /(pneumonia|pnemonia|pnumonia|pneumon|pnm|infect|infected|positive)/i
  if (pneumoniaRe.test(parent) || pneumoniaRe.test(fname)) return true
  if (
    /normal|no|neg|not|healthy/.test(parent) ||
    /normal|healthy|no|neg|not/.test(fname)
  )
    return false
  return null
}

function walk(dir, rel = '') {
  const out = []
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch (err) {
    console.error('Cannot read', dir, err.message)
    return out
  }
  for (const e of entries) {
    const eRel = path.join(rel, e.name)
    const full = path.join(dir, e.name)
    if (e.isDirectory()) {
      out.push(...walk(full, eRel))
    } else if (e.isFile()) {
      if (e.name.match(/\.(jpe?g|png|gif|bmp|webp)$/i)) {
        out.push({
          path: `/data/Pneumonia/${eRel.replace(/\\/g, '/')}`,
          label: inferLabel(rel, e.name),
        })
      }
    }
  }
  return out
}

const base = path.join(process.cwd(), 'public', 'data', 'Pneumonia')
const files = walk(base)
for (const f of files) console.log(f.path, '=>', f.label)
console.log('\nTotal files:', files.length)
