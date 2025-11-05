import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { access_token, refresh_token, expires_at } = body ?? {}

    if (!access_token) {
      return NextResponse.json({ error: 'missing token' }, { status: 400 })
    }

    const res = NextResponse.json({ ok: true })

    const secure = process.env.NODE_ENV === 'production'

    // Determine maxAge (seconds). If expires_at is provided (unix seconds), compute time left.
    let maxAge = 60 * 60 * 24 * 30 // 30 days default
    if (typeof expires_at === 'number') {
      const now = Math.floor(Date.now() / 1000)
      const diff = expires_at - now
      if (diff > 60) maxAge = diff
    }

    res.cookies.set({
      name: 'medqa_session',
      value: access_token,
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge,
    })

    if (refresh_token) {
      res.cookies.set({
        name: 'medqa_refresh',
        value: refresh_token,
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    return res
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[set-session] error', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
