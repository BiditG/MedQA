import { NextResponse } from 'next/server'

// Sign-up via Supabase has been removed. Account creation is handled by
// administrators via the users CRUD API. This route intentionally returns
// a 404/disabled response to avoid confusion.
export async function POST() {
  return NextResponse.json(
    { error: 'Sign-up disabled. Contact an administrator.' },
    { status: 404 },
  )
}
