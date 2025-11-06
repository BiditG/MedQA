import { NextResponse } from 'next/server'

// Premium toggling removed. This project no longer manages 'premium' flags via
// server routes. If you need to manage premium access, update this handler to
// integrate with your production DB (Turso) or manage via admin UI.
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'Premium management disabled. See /admin for alternatives.',
    },
    { status: 501 },
  )
}
