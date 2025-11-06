import { NextResponse } from 'next/server'
import { getAnonClient } from '@/utils/supabase-server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body || {}
    if (!email || !password)
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 },
      )

    const supa = getAnonClient()
    const { data, error } = await supa.auth.signInWithPassword({
      email: String(email),
      password: String(password),
    })
    if (error || !data?.session)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 },
      )

    const { access_token, refresh_token, expires_in } = data.session
    const maxAge = Math.max(1, Math.min(expires_in || 3600, 60 * 60 * 24 * 7))
    const cookieFlags = `${
      process.env.NODE_ENV === 'production' ? ' Secure;' : ''
    } HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`
    const res = NextResponse.json({ ok: true })
    res.headers.append(
      'Set-Cookie',
      `sb-access-token=${encodeURIComponent(access_token)};${cookieFlags}`,
    )
    if (refresh_token) {
      res.headers.append(
        'Set-Cookie',
        `sb-refresh-token=${encodeURIComponent(refresh_token)};${cookieFlags}`,
      )
    }
    return res
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 },
    )
  }
}
