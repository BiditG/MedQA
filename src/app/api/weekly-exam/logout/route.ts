import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  const resp = NextResponse.json({ ok: true })
  resp.cookies.set('weekly_exam_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0), // delete cookie
  })
  return resp
}
