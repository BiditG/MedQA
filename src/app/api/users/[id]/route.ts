// Deprecated in favor of /api/profiles/[id]
import { NextResponse } from 'next/server'
export async function PUT() {
  return NextResponse.json({ error: 'Use /api/profiles/[id]' }, { status: 410 })
}
export async function DELETE() {
  return NextResponse.json({ error: 'Use /api/profiles/[id]' }, { status: 410 })
}
