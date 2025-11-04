import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY
const ENV_CODE = process.env.WEEKLY_EXAM_CODE

async function validateWithWeeklyCodes(code: string): Promise<boolean> {
  if (!URL || !SVC) return false
  try {
    const svc = createClient(URL, SVC, { auth: { persistSession: false } })
    const { data, error } = await svc
      .from('weekly_codes')
      .select('id, active, expires_at')
      .eq('code', code)
      .maybeSingle()
    if (error) return false
    if (!data) return false
    if (data.active === false) return false
    if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now())
      return false
    return true
  } catch {
    return false
  }
}

async function validateWithAppSettings(code: string): Promise<boolean> {
  if (!URL || !SVC) return false
  try {
    const svc = createClient(URL, SVC, { auth: { persistSession: false } })
    const { data, error } = await svc
      .from('app_settings')
      .select('value')
      .eq('key', 'weekly_exam_code')
      .maybeSingle()
    if (error) return false
    const expected = String(data?.value || '')
    return !!expected && expected.trim() === code.trim()
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

    // 1) Prefer weekly_codes table
    if (await validateWithWeeklyCodes(code))
      return NextResponse.json({ ok: true })

    // 2) Fallback to app_settings key
    if (await validateWithAppSettings(code))
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
