import { NextResponse } from 'next/server'

// Old Supabase signin route disabled. Use POST /api/auth/login which returns a
// JWT for authentication.
export async function POST() {
  return NextResponse.json(
    { error: 'Disabled. Use /api/auth/login' },
    { status: 404 },
  )
}
