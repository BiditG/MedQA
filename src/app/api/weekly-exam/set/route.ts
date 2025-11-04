import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase-server'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    return data?.role === 'admin'
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin()))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!URL || !SVC)
      return NextResponse.json(
        {
          error:
            'Server key missing. Set SUPABASE_SERVICE_ROLE_KEY in your environment.',
        },
        { status: 500 },
      )

    const body = await req.json().catch(() => ({}))
    const code = String(body?.code || '')
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null
    const active = body?.active === false ? false : true
    if (!code)
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const svc = createClient(URL, SVC, { auth: { persistSession: false } })
    // Ensure table weekly_codes exists in your DB per provided schema
    const { error } = await svc.from('weekly_codes').insert({
      code,
      active,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    })
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}
