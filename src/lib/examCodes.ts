import fs from 'fs'
import fsp from 'fs/promises'
import path from 'path'

export type ExamCode = {
  id: string
  code: string // the code users enter
  label?: string // optional display label
  active: boolean
  createdAt: string // ISO
  expiresAt?: string // ISO optional
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'exam-codes.json')

async function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    await fsp.mkdir(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    await fsp.writeFile(
      DATA_FILE,
      JSON.stringify({ codes: [] }, null, 2),
      'utf-8',
    )
  }
}

async function readAll(): Promise<ExamCode[]> {
  await ensureStore()
  const raw = await fsp.readFile(DATA_FILE, 'utf-8')
  const json = JSON.parse(raw)
  return Array.isArray(json.codes) ? (json.codes as ExamCode[]) : []
}

async function writeAll(codes: ExamCode[]) {
  await ensureStore()
  await fsp.writeFile(DATA_FILE, JSON.stringify({ codes }, null, 2), 'utf-8')
}

function randomId() {
  return (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  )
}

function generateHumanCode() {
  // 4-4 upper alnum excluding ambiguous chars
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = (n: number) =>
    Array.from(
      { length: n },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join('')
  return `${pick(4)}-${pick(4)}`
}

function isExpired(code: ExamCode) {
  return code.expiresAt ? Date.now() > Date.parse(code.expiresAt) : false
}

export async function listExamCodes(): Promise<ExamCode[]> {
  return readAll()
}

export async function createExamCode(input: {
  label?: string
  expiresAt?: string
  code?: string
}) {
  const codes = await readAll()
  let value = (input.code || generateHumanCode()).toUpperCase().trim()
  while (codes.some((c) => c.code.toUpperCase() === value)) {
    value = generateHumanCode()
  }
  const item: ExamCode = {
    id: randomId(),
    code: value,
    label: input.label?.trim() || undefined,
    active: true,
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt
      ? new Date(input.expiresAt).toISOString()
      : undefined,
  }
  codes.unshift(item)
  await writeAll(codes)
  return item
}

export async function updateExamCode(
  id: string,
  patch: Partial<Pick<ExamCode, 'label' | 'active' | 'expiresAt'>>,
) {
  const codes = await readAll()
  const idx = codes.findIndex((c) => c.id === id)
  if (idx === -1) return null
  const updated: ExamCode = {
    ...codes[idx],
    ...(patch.label !== undefined ? { label: patch.label } : {}),
    ...(patch.active !== undefined ? { active: !!patch.active } : {}),
    ...(patch.expiresAt !== undefined
      ? {
          expiresAt: patch.expiresAt
            ? new Date(patch.expiresAt).toISOString()
            : undefined,
        }
      : {}),
  }
  codes[idx] = updated
  await writeAll(codes)
  return updated
}

export async function deleteExamCode(id: string) {
  const codes = await readAll()
  const next = codes.filter((c) => c.id !== id)
  if (next.length === codes.length) return false
  await writeAll(next)
  return true
}

export async function verifyExamCode(inputCode: string) {
  const value = (inputCode || '').toUpperCase().trim()
  if (!value) return { ok: false, error: 'Missing code' as const }
  const codes = await readAll()
  const found = codes.find((c) => c.code.toUpperCase() === value)
  if (!found) return { ok: false, error: 'Invalid code' as const }
  if (!found.active) return { ok: false, error: 'Code is disabled' as const }
  if (isExpired(found)) return { ok: false, error: 'Code expired' as const }
  return { ok: true as const, code: found }
}
