#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

// Simple CSV parse/stringify that handles quotes and newlines
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
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      row.push(cur)
      cur = ''
      if (row.length) rows.push(row)
      row = []
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else {
      cur += ch
    }
  }
  if (cur !== '' || row.length) {
    row.push(cur)
    rows.push(row)
  }
  return rows
}

function toCSV(rows) {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = cell == null ? '' : String(cell)
          return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
        })
        .join(','),
    )
    .join('\n')
}

function normalize(s) {
  return (s || '').toString().toLowerCase()
}

function countRe(text, re) {
  let m,
    c = 0
  while ((m = re.exec(text)) !== null) {
    c++
    if (!re.global) break
  }
  return c
}

// Build robust, weighted regex heuristics for high-accuracy subject classification
function classifySubject(q, exp, optionsJoined, cfg) {
  const raw = [q, exp, optionsJoined].filter(Boolean).join(' ')
  const text = normalize(raw)

  // Physics indicators (mechanics, EM, thermo, optics, earth/space folded into Physics by request)
  const physPatterns = [
    [
      /\b(newton|joule|watt|pascal|pa|bar|tesla|volt|ohm|ampere|amp|coulomb|kelvin|hz|hertz)\b/i,
      4,
    ],
    [/\b(m\/?s\^?2?|kg|n|j|w|v|a|ω|Ω|°c|\d+\s*(m|km)\b)/i, 3],
    [
      /\b(velocity|acceleration|momentum|projectile|trajectory|torque|angular|oscillation|resonance)\b/i,
      3,
    ],
    [/\b(force|energy|power|mechanics|kinematics|dynamics)\b/i, 2],
    [
      /\b(circuit|current|voltage|resistance|capacitor|inductor|resistor|kirchhoff|ohm)\b/i,
      4,
    ],
    [/\b(magnetic|magnetism|faraday|maxwell|lorentz|flux|induction)\b/i, 3],
    [
      /\b(optics|lens|mirror|refraction|reflection|snell|diffraction|interference|doppler)\b/i,
      3,
    ],
    [
      /\b(thermodynamics|entropy|temperature|specific heat|conduction|convection|radiation)\b/i,
      3,
    ],
    [
      /\b(gravity|gravitational|orbital|satellite|escape velocity|astronomy|galaxy|cosmos|cosmology|black hole|supernova|redshift)\b/i,
      3,
    ],
    [
      /\b(earthquake|seismic|plate\s+tectonic|volcano|glacier|atmosphere|troposphere|weathering|erosion|ocean\s+current)\b/i,
      3,
    ],
    [
      /\b(radioactive|alpha\s+decay|beta\s+decay|gamma\s+ray|half-?life|fusion|fission|nuclear)\b/i,
      4,
    ],
  ]

  // Chemistry indicators
  const chemPatterns = [
    [/\bpH\b|pKa|pKb/i, 5],
    [
      /\b(acid|base|buffer|neutralization|titration|indicator|equivalence\s+point)\b/i,
      4,
    ],
    [
      /\b(oxidation|reduction|redox|oxidize|reduce|anode|cathode|electrochem|nernst)\b/i,
      4,
    ],
    [/\b(stoichiometry|molarity|molality|moles?|avogadro|concentration)\b/i, 4],
    [
      /\b(enthalpy|entropy|gibbs|free\s+energy|thermochemistry|calorimetry|endothermic|exothermic)\b/i,
      4,
    ],
    [
      /\b(ionic|covalent|metallic|lattice\s+energy|crystal\s+lattice|coordination|ligand)\b/i,
      3,
    ],
    [
      /\b(alkane|alkene|alkyne|aromatic|benzene|isomer|chiral|enantiomer|diastereomer|functional\s+group)\b/i,
      4,
    ],
    [
      /\b(alcohol|aldehyde|ketone|carboxylic\s+acid|ester|amide|ether|halide|amine|nitrile|phenol|thiol)\b/i,
      4,
    ],
    [
      /\b(solution|solvent|solute|precipitation|ksp|solubility|raoult|henry)\b/i,
      3,
    ],
    [
      /\b(rate\s+law|kinetics|catalyst|mechanism|equilibrium|le\s+chatelier)\b/i,
      3,
    ],
    [/\b(ir|nmr|uv-?vis|mass\s+spectrometry|chromatography|tlc|hplc|gc)\b/i, 3],
    [/\b(gas\s+law|boyle|charles|ideal\s+gas|van\s+der\s+waals)\b/i, 3],
    [
      /\b(oxide|chloride|sulfate|sulphate|nitrate|carbonate|hydroxide|phosphate)\b/i,
      3,
    ],
    [/[A-Z][a-z]?\d{1,3}(?:[A-Z][a-z]?\d{0,3})*/g, 2], // chemical formula tokens like H2O, NaCl
  ]

  // Biology indicators
  const bioPatterns = [
    [
      /\b(cell|cells|organelle|nucleus|nuclei|mitochondria|chloroplast|ribosome|cytoplasm|membrane|phospholipid)\b/i,
      4,
    ],
    [
      /\b(osmosis|diffusion|homeostasis|enzyme|protein|carbohydrate|lipid|nucleic\s+acid)\b/i,
      3,
    ],
    [
      /\b(dna|rna|transcription|translation|gene|allele|genotype|phenotype|mutation|genome|meiosis|mitosis|chromosome|chromatid|cytokinesis)\b/i,
      5,
    ],
    [
      /\b(gamete|zygote|fertilization|embryology|development|hormone|endocrine|neuron|synapse|neurotransmitter)\b/i,
      4,
    ],
    [
      /\b(photosynthesis|calvin\s+cycle|light\s+reaction|respiration|glycolysis|krebs|electron\s+transport|atp)\b/i,
      4,
    ],
    [
      /\b(ecology|ecosystem|population|community|biome|biodiversity|trophic|producer|consumer|decomposer|symbiosis|niche|succession)\b/i,
      3,
    ],
    [
      /\b(anatomy|physiology|tissue|organ\b|organ\s+system|circulatory|cardiovascular|respiratory|digestive|renal|urinary|immune|lymphatic|nervous|muscular|skeletal|reproductive|aorta|artery|kidney|renal|liver|lung|stomach)\b/i,
      5,
    ],
    [
      /\b(bacteria|archaea|virus|viral|fungi|protist|angiosperm|gymnosperm|plant|animal|mammal|bird|amphibian|reptile)\b/i,
      3,
    ],
  ]

  function score(patterns) {
    let s = 0
    for (const [re, w] of patterns) {
      s += countRe(raw, re) * w
    }
    return s
  }

  let sPhys = score(physPatterns)
  let sChem = score(chemPatterns)
  let sBio = score(bioPatterns)

  // Penalize overlapping generic terms by boosting the most specific ones
  // If strong chem markers like pH/functional groups present, reduce physics earth bias
  if (/\bpH\b|pKa|pKb|functional\s+group|titration|equilibrium/i.test(text))
    sPhys *= 0.7
  // If strong bio genetics/anatomy present, reduce physics/chem a bit
  if (
    /(dna|rna|mitosis|meiosis|chromosome|embry|neuron|artery|kidney|renal)/i.test(
      text,
    )
  ) {
    sPhys *= 0.7
    sChem *= 0.8
  }
  // If earth-science terms without chem/bio specifics, bias to Physics
  if (
    /(earthquake|volcano|glacier|atmosphere|troposphere|weathering|erosion)/i.test(
      text,
    ) &&
    sChem < 6 &&
    sBio < 6
  )
    sPhys += 4

  const entries = [
    ['Biology', sBio],
    ['Chemistry', sChem],
    ['Physics', sPhys],
  ]
  entries.sort((a, b) => b[1] - a[1])
  const [bestName, bestScore] = entries[0]
  const secondScore = entries[1][1]

  // Confidence threshold: ensure best is meaningfully above second
  const minScore =
    cfg && typeof cfg.confidence === 'number' ? cfg.confidence : 4
  const margin = cfg && typeof cfg.margin === 'number' ? cfg.margin : 1.25
  if (cfg && cfg.aggressive) return bestName
  const confident = bestScore >= minScore && bestScore >= secondScore * margin
  return confident ? bestName : ''
}

function parseArgs(argv) {
  const args = {
    input: path.join('public', 'data', 'train.converted.csv'),
    output: null,
    overwrite: false,
    dryRun: false,
    aggressive: false,
    confidence: undefined,
    margin: undefined,
  }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--input' || a === '-i') args.input = argv[++i]
    else if (a === '--output' || a === '-o') args.output = argv[++i]
    else if (a === '--overwrite') args.overwrite = true
    else if (a === '--dry-run' || a === '--dry') args.dryRun = true
    else if (a === '--aggressive') args.aggressive = true
    else if (a === '--confidence') {
      const v = parseFloat(argv[++i])
      if (!Number.isNaN(v)) args.confidence = Math.max(0, v)
    } else if (a === '--margin') {
      const v = parseFloat(argv[++i])
      if (!Number.isNaN(v)) args.margin = Math.max(0, v)
    } else if (!args.input) args.input = a
  }
  return args
}

function main() {
  const args = parseArgs(process.argv)
  const INPUT = args.input
  const csv = fs.readFileSync(INPUT, 'utf8')
  const rows = parseCSV(csv)
  if (!rows.length) {
    console.error('No rows in CSV')
    process.exit(1)
  }
  const header = rows[0]
  const idx = Object.fromEntries(
    header.map((h, i) => [h.trim().toLowerCase(), i]),
  )
  const required = [
    'id',
    'subject',
    'question',
    'optiona',
    'optionb',
    'optionc',
    'optiond',
    'answer',
    'explanation',
  ]
  for (const k of required)
    if (!(k in idx)) {
      console.error('Missing column in CSV header:', k)
      process.exit(1)
    }

  const out = [header]
  let filled = 0
  let already = 0
  let overwritten = 0
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.length === 0) continue
    const subj = (row[idx['subject']] || '').trim()

    const q = row[idx['question']] || ''
    const exp = row[idx['explanation']] || ''
    const opts = [
      row[idx['optiona']] || '',
      row[idx['optionb']] || '',
      row[idx['optionc']] || '',
      row[idx['optiond']] || '',
    ].join(' ')
    const classified = classifySubject(q, exp, opts, {
      aggressive: args.aggressive,
      confidence: args.confidence,
      margin: args.margin,
    })

    if (subj) {
      already++
      if (args.overwrite && classified) {
        row[idx['subject']] = classified
        overwritten++
      }
      out.push(row)
      continue
    }

    if (classified) {
      row[idx['subject']] = classified
      filled++
    }
    out.push(row)
  }

  if (args.dryRun) {
    console.log(
      '[dry-run] Would fill:',
      filled,
      'Overwrite candidates:',
      overwritten,
      'Already present:',
      already,
      '\nOptions => aggressive:',
      !!args.aggressive,
      'confidence:',
      args.confidence ?? 4,
      'margin:',
      args.margin ?? 1.25,
    )
    return
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outputPath = args.output || INPUT
  if (!args.output) {
    const backup = INPUT + '.' + ts + '.bak'
    fs.writeFileSync(backup, csv)
    console.log('Backup written to', backup)
  }
  const outCSV = toCSV(out)
  fs.writeFileSync(outputPath, outCSV)
  console.log('Updated file written to', outputPath)
  console.log(
    'Subjects filled:',
    filled,
    'Overwritten:',
    overwritten,
    'Already present:',
    already,
  )
}

if (require.main === module) main()
/**
Usage Examples:
  node scripts/fill-subjects.js                           # Fill only blank subjects (default confidence)
  node scripts/fill-subjects.js --dry-run                # Show planned fills without writing
  node scripts/fill-subjects.js --overwrite              # Reclassify rows with confident new labels
  node scripts/fill-subjects.js --aggressive --overwrite # Force best-guess labeling of ALL rows
  node scripts/fill-subjects.js --confidence 2 --margin 1.1 --overwrite # Relax thresholds (lower min score and margin)
  node scripts/fill-subjects.js -i public/data/train.converted.csv -o public/data/train.converted.filled.csv

Flags:
  --input|-i <file>     Input CSV (default public/data/train.converted.csv)
  --output|-o <file>    Output file; omit to modify input (backup auto-created)
  --dry-run|--dry       No writes; report counts
  --overwrite           Overwrite existing non-empty subject values when classification available
  --aggressive          Skip confidence checks; always assign best scoring subject
  --confidence <num>    Minimum score required (default 4); set lower to classify shorter questions
  --margin <num>        Required multiplicative advantage over second best (default 1.25)

Classification Notes:
  Physics absorbs earth/space/astronomy and geoscience to restrict subjects to Biology/Chemistry/Physics.
  Aggressive mode can introduce noise; prefer a validation pass if model training is sensitive.
*/
