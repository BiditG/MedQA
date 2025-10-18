import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'not authenticated' }, { status: 401 })

    // Try to read the caller's role using the service-role key so RLS won't hide
    // the role column. Fall back to the session-backed client if service key
    // isn't configured.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let me: any = null
    if (supabaseUrl && serviceKey) {
      try {
        const svc = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false },
        })
        const { data: svcMe } = await svc
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        me = svcMe
      } catch (e) {
        console.error('[admin][set-premium] svc lookup failed', e)
      }
    }
    if (!me) {
      // Fallback to RLS-backed lookup (may hide role column depending on policies)
      const { data: rlsMe } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      me = rlsMe
    }

    // log caller for debug
    console.log('[admin][set-premium] caller', {
      caller_id: user.id,
      caller_role: me?.role,
    })
    if (!me || me.role !== 'admin') {
      console.log('[admin][set-premium] unauthorized caller', {
        caller_id: user.id,
        caller_role: me?.role,
      })
      // Return extra debug info in dev to help diagnose why callers are rejected.
      return NextResponse.json(
        {
          error: 'not authorized',
          caller_id: user.id,
          caller_role: me?.role ?? null,
        },
        { status: 403 },
      )
    }

    const body = await req.json()
    const id = String(body?.id || '')
    // robust boolean parsing: accept true/false or 'true'/'false' or 1/0
    const raw = body?.value
    const value = raw === true || raw === 'true' || raw === '1' || raw === 1
    console.log('[admin][set-premium] payload', {
      target: id,
      rawValue: raw,
      parsedValue: value,
    })
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key)
      return NextResponse.json(
        { error: 'service role key not configured' },
        { status: 500 },
      )

    const svc = createClient(url, key, { auth: { persistSession: false } })

    // If granting premium, set expiry 30 days from now. If revoking, clear expiry.
    const expiresAt = value
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null
    const updatePayload: any = { premium: value }
    if (expiresAt) updatePayload.premium_expires_at = expiresAt
    else updatePayload.premium_expires_at = null

    const { data, error } = await svc
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select('id,premium,premium_expires_at')
      .maybeSingle()
    if (error)
      return NextResponse.json(
        { error: error.message || String(error) },
        { status: 500 },
      )

    return NextResponse.json({
      ok: true,
      id,
      premium: data?.premium ?? value,
      premium_expires_at: data?.premium_expires_at ?? expiresAt,
    })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
