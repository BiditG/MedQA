import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const expired = 'Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/;'
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : ''
  res.headers.append(
    'Set-Cookie',
    `sb-access-token=; HttpOnly; SameSite=Lax;${secure} ${expired}`,
  )
  res.headers.append(
    'Set-Cookie',
    `sb-refresh-token=; HttpOnly; SameSite=Lax;${secure} ${expired}`,
  )
  return res
}

export async function GET() {
  // Sign-out helper removed. Client should clear local token and cookie.
  return NextResponse.json({
    ok: true,
    message: 'Sign-out disabled on server; clear client token',
  })
}
