// Deprecated in favor of /api/profiles
import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ error: 'Use /api/profiles' }, { status: 410 })
}
export async function POST() {
  return NextResponse.json({ error: 'Use /api/profiles' }, { status: 410 })
}
