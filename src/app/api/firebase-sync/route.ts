import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Firebase sync removed' }, { status: 410 })
}
