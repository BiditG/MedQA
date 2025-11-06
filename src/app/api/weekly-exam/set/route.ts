import { NextResponse } from 'next/server'
import {
  requireAdminFromRequest,
  getServiceClient,
} from '@/utils/supabase-server'

async function ensureWeeklyCodes(sql: any) {
  await sql`
    CREATE TABLE IF NOT EXISTS weekly_codes (
      code TEXT PRIMARY KEY,
      active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMPTZ
    )
  `
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '')
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null
    const active = body?.active === false ? false : true
    if (!code)
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    // Store in Supabase public.weekly_codes (table must exist)
    const svc = getServiceClient()
    const { error } = await svc
      .from('weekly_codes')
      .upsert(
        {
          code,
          active,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        },
        { onConflict: 'code' },
      )
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
