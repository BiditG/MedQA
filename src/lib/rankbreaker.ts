import crypto from 'crypto'

const SECRET =
  process.env.CEE_RANKBREAKER_SECRET ||
  process.env.EXAM_CODE_SECRET ||
  'change-me-in-production'

export const RANKBREAKER_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Zoology',
  'Botany',
  'Mental Agility Test',
] as const

export type RankbreakerSubject = (typeof RANKBREAKER_SUBJECTS)[number]

export function normalizeWhatsAppNumber(value: unknown) {
  let digits = String(value || '')
    .trim()
    .replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length < 7 || digits.length > 15) return null
  return `+${digits}`
}

export function normalizeAccessCode(value: unknown) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

export function accessCodeDigest(value: unknown) {
  return crypto
    .createHmac('sha256', SECRET)
    .update(normalizeAccessCode(value))
    .digest('hex')
}

export function generateAccessCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = () =>
    Array.from(
      { length: 5 },
      () => alphabet[crypto.randomInt(alphabet.length)],
    ).join('')
  return `RB-${part()}-${part()}`
}

function b64url(value: string | Buffer) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function signRankbreakerSession(attemptId: string, exp: number) {
  const body = b64url(JSON.stringify({ attemptId, exp }))
  const signature = b64url(
    crypto.createHmac('sha256', SECRET).update(body).digest(),
  )
  return `${body}.${signature}`
}

export function verifyRankbreakerSession(token: string | undefined) {
  if (!token) return null
  const [body, signature] = token.split('.')
  if (!body || !signature) return null
  const expected = b64url(
    crypto.createHmac('sha256', SECRET).update(body).digest(),
  )
  if (
    signature.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null
  try {
    const payload = JSON.parse(
      Buffer.from(
        body.replace(/-/g, '+').replace(/_/g, '/'),
        'base64',
      ).toString('utf8'),
    )
    if (!payload?.attemptId || Number(payload.exp) * 1000 < Date.now())
      return null
    return { attemptId: String(payload.attemptId), exp: Number(payload.exp) }
  } catch {
    return null
  }
}

export type ImportedQuestion = {
  id: string
  subject: RankbreakerSubject
  chapter: string
  topic: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export const CSV_HEADER = [
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
]

export function parseRankbreakerCsv(input: string): {
  rows: ImportedQuestion[]
  errors: string[]
} {
  const parsed: string[][] = []
  let cell = '',
    row: string[] = [],
    quoted = false
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === '"') {
      if (quoted && input[i + 1] === '"') {
        cell += '"'
        i++
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      row.push(cell)
      parsed.push(row)
      row = []
      cell = ''
      if (char === '\r' && input[i + 1] === '\n') i++
    } else cell += char
  }
  if (quoted) return { rows: [], errors: ['CSV has an unclosed quoted field.'] }
  if (cell || row.length) {
    row.push(cell)
    parsed.push(row)
  }
  const errors: string[] = []
  const header = (parsed.shift() || []).map((field) => field.trim())
  if (
    header.length !== CSV_HEADER.length ||
    header.some((field, i) => field !== CSV_HEADER[i])
  ) {
    return {
      rows: [],
      errors: ['Header must exactly match the downloadable template.'],
    }
  }
  const ids = new Set<string>()
  const rows: ImportedQuestion[] = []
  parsed.forEach((values, index) => {
    const line = index + 2
    if (values.every((value) => !value.trim())) return
    if (values.length !== CSV_HEADER.length) {
      errors.push(`Row ${line}: expected ${CSV_HEADER.length} columns.`)
      return
    }
    const record = Object.fromEntries(
      CSV_HEADER.map((field, i) => [field, values[i].trim()]),
    ) as Record<string, string>
    const required = CSV_HEADER.slice(0, 10).filter((field) => !record[field])
    if (required.length)
      errors.push(`Row ${line}: missing ${required.join(', ')}.`)
    if (ids.has(record.id))
      errors.push(`Row ${line}: duplicate id "${record.id}".`)
    ids.add(record.id)
    if (!RANKBREAKER_SUBJECTS.includes(record.subject as RankbreakerSubject))
      errors.push(`Row ${line}: unsupported subject "${record.subject}".`)
    if (!/^(PHY|CHE|ZOO|BOT|MAT)-[A-Z0-9]+-[A-Z0-9]+-\d{3,}$/i.test(record.id))
      errors.push(
        `Row ${line}: id must follow PHY/CHE/ZOO/BOT/MAT-CHAPTER-TOPIC-001.`,
      )
    const prefix = record.id.split('-')[0]?.toUpperCase()
    const subjectPrefixes: Record<string, string> = {
      Physics: 'PHY',
      Chemistry: 'CHE',
      Zoology: 'ZOO',
      Botany: 'BOT',
      'Mental Agility Test': 'MAT',
    }
    if (
      record.subject &&
      subjectPrefixes[record.subject] &&
      prefix !== subjectPrefixes[record.subject]
    )
      errors.push(
        `Row ${line}: id prefix must match subject ${record.subject}.`,
      )
    if (!['A', 'B', 'C', 'D'].includes(record.answer.toUpperCase()))
      errors.push(`Row ${line}: answer must be A, B, C, or D.`)
    rows.push({
      id: record.id,
      subject: record.subject as RankbreakerSubject,
      chapter: record.chapter,
      topic: record.topic,
      question: record.question,
      optionA: record.optionA,
      optionB: record.optionB,
      optionC: record.optionC,
      optionD: record.optionD,
      answer: record.answer.toUpperCase() as ImportedQuestion['answer'],
      explanation: record.explanation,
    })
  })
  return { rows, errors }
}
