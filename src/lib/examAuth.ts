import crypto from 'crypto'

const SECRET = process.env.EXAM_CODE_SECRET || 'dev-insecure-secret-change-me'

function b64url(input: Buffer | string) {
  // Narrow the union before calling Buffer APIs
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function b64urlDecode(input: string): string {
  // Convert base64url -> base64 and pad
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  return Buffer.from(base64, 'base64').toString('utf8')
}

export function signExamToken(payload: { code: string; exp: number }) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const h = b64url(JSON.stringify(header))
  const p = b64url(JSON.stringify(payload))
  const data = `${h}.${p}`
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest()
  const s = b64url(sig)
  return `${data}.${s}`
}

export function verifyExamToken(
  token: string,
): { code: string; exp: number } | null {
  if (!token || token.split('.').length !== 3) return null
  const [h, p, s] = token.split('.')
  const data = `${h}.${p}`
  const expected = b64url(
    crypto.createHmac('sha256', SECRET).update(data).digest(),
  )
  if (s !== expected) return null
  try {
    const payload = JSON.parse(b64urlDecode(p))
    if (!payload?.code || !payload?.exp) return null
    if (payload.exp * 1000 < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
