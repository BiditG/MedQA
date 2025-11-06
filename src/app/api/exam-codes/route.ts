import { NextResponse } from 'next/server'
import { createExamCode, listExamCodes } from '@/lib/examCodes'

export const runtime = 'nodejs'

export async function GET() {
  // TODO: enforce admin auth
  const codes = await listExamCodes()
  return NextResponse.json({ codes })
}

export async function POST(req: Request) {
  // TODO: enforce admin auth
  try {
    const body = await req.json().catch(() => ({}))
    const { label, expiresAt, code } = body || {}
    const created = await createExamCode({ label, expiresAt, code })
    return NextResponse.json({ ok: true, code: created })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Create failed' },
      { status: 400 },
    )
  }
}
