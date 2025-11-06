import jwt from 'jsonwebtoken'
import type { IncomingHttpHeaders } from 'http'

const JWT_SECRET = process.env.JWT_SECRET || 'please-set-a-real-secret'

export interface TokenPayload {
  id: string
  email: string
  name?: string
  role?: string
  iat?: number
  exp?: number
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (err) {
    throw new Error('Invalid or expired token')
  }
}

export function getAuthHeader(
  headers: IncomingHttpHeaders | Record<string, string | undefined>,
) {
  // header names can be lowercased depending on environment
  const auth =
    (headers['authorization'] as string) ||
    (headers['Authorization'] as unknown as string) ||
    ''
  return auth
}
