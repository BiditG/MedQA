import { NextResponse } from 'next/server'
import { verifyExamCode } from '@/lib/examCodes'
import { signExamToken } from '@/lib/examAuth'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    const res = await verifyExamCode(code)
    if (!res.ok || !res.code) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 401 })
    }

    // Token expiry = min(code expiry, 24h from now)
    const now = Date.now()
    const ttlMs = 24 * 60 * 60 * 1000
    const candidate = now + ttlMs
    const expMs = res.code.expiresAt
      ? Math.min(candidate, Date.parse(res.code.expiresAt))
      : candidate
    const token = signExamToken({
      code: res.code.code,
      exp: Math.floor(expMs / 1000),
    })

    const resp = NextResponse.json({
      ok: true,
      exp: new Date(expMs).toISOString(),
    })
    resp.cookies.set('weekly_exam_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      expires: new Date(expMs),
    })
    return resp
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Bad request' },
      { status: 400 },
    )
  }
}
