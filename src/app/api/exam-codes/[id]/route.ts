import { NextResponse } from 'next/server'
import { deleteExamCode, updateExamCode } from '@/lib/examCodes'

export const runtime = 'nodejs'

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  // TODO: enforce admin auth
  try {
    const body = await req.json().catch(() => ({}))
    const updated = await updateExamCode(ctx.params.id, {
      label: body?.label,
      active: body?.active,
      expiresAt: body?.expiresAt,
    })
    if (!updated)
      return NextResponse.json(
        { ok: false, error: 'Not found' },
        { status: 404 },
      )
    return NextResponse.json({ ok: true, code: updated })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || 'Update failed' },
      { status: 400 },
    )
  }
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  // TODO: enforce admin auth
  const ok = await deleteExamCode(ctx.params.id)
  if (!ok)
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
