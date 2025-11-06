import { NextResponse } from 'next/server'

// Debug route disabled after migration to Supabase. Use Supabase dashboard instead.
export async function GET() {
  return NextResponse.json({ error: 'debug route disabled' }, { status: 410 })
}
