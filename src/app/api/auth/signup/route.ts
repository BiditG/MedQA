import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerServerClient } from '@/utils/supabase-server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body
    if (!email || !password)
      return NextResponse.json(
        { error: 'Missing credentials' },
        { status: 400 },
      )

    const res = NextResponse.json({ ok: true, message: 'Account created' })
    const supabase = createRouteHandlerServerClient(res)

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.log('[api/auth/signup] error', error)
      return NextResponse.json(
        { error: error.message || 'Sign-up failed' },
        { status: 400 },
      )
    }

    const user = data.user
    if (user) {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (url && key) {
          const svc = createClient(url, key, {
            auth: { persistSession: false },
          })
          const { data: existing } = await svc
            .from('profiles')
            .select('role,premium')
            .eq('id', user.id)
            .maybeSingle()
          if (existing) {
            const { error: upErr } = await svc
              .from('profiles')
              .upsert(
                {
                  id: user.id,
                  email: user.email,
                  role: existing.role,
                  premium: existing.premium ?? false,
                },
                { onConflict: 'id' },
              )
            if (upErr)
              console.log('[api/auth/signup] profile upsert error', upErr)
          } else {
            const { error: insErr } = await svc
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'user',
                premium: false,
              })
            if (insErr)
              console.log('[api/auth/signup] profile insert error', insErr)
          }
        } else {
          // Service role not available — check via RLS and only insert if missing
          try {
            const { data: existing } = await supabase
              .from('profiles')
              .select('role,premium')
              .eq('id', user.id)
              .maybeSingle()
            if (!existing) {
              const { error: insErr } = await supabase
                .from('profiles')
                .insert({
                  id: user.id,
                  email: user.email,
                  role: 'user',
                  premium: false,
                })
              if (insErr)
                console.log(
                  '[api/auth/signup] fallback profile insert error',
                  insErr,
                )
            }
          } catch (e) {
            console.log(
              '[api/auth/signup] fallback profile check/insert error',
              e,
            )
          }
        }
      } catch (e) {
        console.log('[api/auth/signup] profile upsert exception', e)
      }
    }

    return res
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 })
  }
}
