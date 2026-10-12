import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function PATCH(
  req: Request,
  { params }: { params: { codeId: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const patch: Record<string, unknown> = {}
    if (typeof body.active === 'boolean') patch.active = body.active
    if (body.label !== undefined)
      patch.label = String(body.label || '').trim() || null
    if (body.maxUses !== undefined)
      patch.max_uses =
        body.maxUses === '' || body.maxUses === null
          ? null
          : Number(body.maxUses)
    if (body.expiresAt !== undefined)
      patch.expires_at = body.expiresAt
        ? new Date(body.expiresAt).toISOString()
        : null
    const { data, error } = await getServiceClient()
      .from('cee_rankbreaker_access_codes')
      .update(patch)
      .eq('id', params.codeId)
      .select(
        'id, code_value, label, active, expires_at, max_uses, use_count, created_at',
      )
      .single()
    if (error) throw error
    return NextResponse.json({ code: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not update code.' },
      { status: 400 },
    )
  }
}
