import { NextResponse } from 'next/server'
import { getServiceClient } from '@/utils/supabase-server'

const ENV_CODE = process.env.WEEKLY_EXAM_CODE

async function validateWithWeeklyCodesSupabase(code: string): Promise<boolean> {
  try {
    const svc = getServiceClient()
    const { data, error } = await svc
      .from('weekly_codes')
      .select('active,expires_at')
      .eq('code', code)
      .maybeSingle()
    if (error || !data) return false
    if (data.active === false) return false
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now())
      return false
    return true
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '')
    if (!code)
      return NextResponse.json(
        { ok: false, error: 'Missing code' },
        { status: 400 },
      )

    // 1) Prefer Supabase table if available
    if (await validateWithWeeklyCodesSupabase(code))
      return NextResponse.json({ ok: true })

    // 3) Fallback to env var
    if (ENV_CODE && ENV_CODE.trim() === code.trim())
      return NextResponse.json({ ok: true })

    return NextResponse.json(
      { ok: false, error: 'Invalid or expired code' },
      { status: 401 },
    )
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message || String(e) },
      { status: 500 },
    )
  }
}
