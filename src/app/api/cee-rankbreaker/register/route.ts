import { NextResponse } from 'next/server'
import { getServiceClient, getUserFromRequest } from '@/utils/supabase-server'
import {
  accessCodeDigest,
  normalizeAccessCode,
  normalizeWhatsAppNumber,
  signRankbreakerSession,
} from '@/lib/rankbreaker'

export const runtime = 'nodejs'
const failures = new Map<string, { count: number; until: number }>()

function clientKey(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}
function reject(key: string) {
  const item = failures.get(key) || { count: 0, until: 0 }
  item.count += 1
  if (item.count >= 5) item.until = Date.now() + 10 * 60_000
  failures.set(key, item)
}

export async function POST(req: Request) {
  const key = clientKey(req)
  const rate = failures.get(key)
  if (rate?.until && rate.until > Date.now())
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again later.' },
      { status: 429 },
    )
  try {
    const body = await req.json()
    const name = String(body?.fullName || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 80)
    const phone = normalizeWhatsAppNumber(body?.whatsApp)
    const code = normalizeAccessCode(body?.accessCode)
    if (!name || !phone || !code || body?.acceptedRules !== true)
      return NextResponse.json(
        {
          error:
            'Name, WhatsApp number, access code, and rule consent are required.',
        },
        { status: 400 },
      )
    const supabase = getServiceClient()
    const { user } = await getUserFromRequest(req).catch(() => ({ user: null }))
    const { data: attemptId, error } = await supabase.rpc(
      'cee_rankbreaker_register',
      {
        p_code_digest: accessCodeDigest(code),
        p_name: name,
        p_phone: phone,
        p_account_id: user?.id || null,
      },
    )
    if (error) {
      if (error.message.includes('Invalid, expired')) {
        reject(key)
        return NextResponse.json(
          { error: 'Invalid, expired, disabled, or unavailable access code.' },
          { status: 401 },
        )
      }
      if (error.message.includes('Only one ranked'))
        return NextResponse.json(
          {
            error: 'Only one ranked attempt is allowed for this exam edition.',
          },
          { status: 409 },
        )
      throw error
    }
    failures.delete(key)
    const expiry = Math.floor((Date.now() + 12 * 60 * 60_000) / 1000)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(
      'cee_rankbreaker_token',
      signRankbreakerSession(String(attemptId), expiry),
      {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: new Date(expiry * 1000),
      },
    )
    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Registration failed.' },
      { status: 500 },
    )
  }
}
