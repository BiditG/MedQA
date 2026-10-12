import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'
import {
  accessCodeDigest,
  generateAccessCode,
  normalizeAccessCode,
} from '@/lib/rankbreaker'

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { data, error } = await getServiceClient()
    .from('cee_rankbreaker_access_codes')
    .select(
      'id, code_value, label, active, expires_at, max_uses, use_count, created_at',
    )
    .eq('edition_id', params.id)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ codes: data || [] })
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json()
    const code = normalizeAccessCode(body.code || generateAccessCode())
    const { data: edition, error: editionError } = await getServiceClient()
      .from('cee_rankbreaker_editions')
      .select('status')
      .eq('id', params.id)
      .single()
    if (editionError || !edition)
      return NextResponse.json({ error: 'Edition not found.' }, { status: 404 })
    if (edition.status !== 'published')
      return NextResponse.json(
        {
          error:
            'Publish the 200-question edition before creating an access code.',
        },
        { status: 409 },
      )
    const maxUses =
      body.maxUses === '' || body.maxUses === undefined
        ? null
        : Number(body.maxUses)
    if (
      !code ||
      (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1))
    )
      return NextResponse.json(
        { error: 'Invalid access code or usage limit.' },
        { status: 400 },
      )
    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    if (expiresAt && Number.isNaN(expiresAt.valueOf()))
      return NextResponse.json({ error: 'Invalid expiry.' }, { status: 400 })
    const { data, error } = await getServiceClient()
      .from('cee_rankbreaker_access_codes')
      .insert({
        edition_id: params.id,
        code_digest: accessCodeDigest(code),
        code_value: code,
        label: String(body.label || '').trim() || null,
        max_uses: maxUses,
        expires_at: expiresAt?.toISOString() || null,
      })
      .select(
        'id, code_value, label, active, expires_at, max_uses, use_count, created_at',
      )
      .single()
    if (error) throw error
    return NextResponse.json(
      { code: data, plaintextCode: code },
      { status: 201 },
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not create code.' },
      { status: 400 },
    )
  }
}
