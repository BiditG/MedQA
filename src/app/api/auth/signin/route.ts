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

    const res = NextResponse.json({
      ok: true,
      message: 'Signed in successfully',
    })
    const supabase = createRouteHandlerServerClient(res)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      console.log('[api/auth/signin] error', error)
      return NextResponse.json(
        { error: error.message || 'Sign-in failed' },
        { status: 400 },
      )
    }

    const user = data.user
    if (user) {
      // ensure profile exists. Prefer service role to read existing role and write safely.
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
            // preserve whatever role/premium already exists
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
              console.log('[api/auth/signin] profile upsert error', upErr)
          } else {
            // insert new profile as a new user
            const { error: insErr } = await svc
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                role: 'user',
                premium: false,
              })
            if (insErr)
              console.log('[api/auth/signin] profile insert error', insErr)
          }
        } else {
          // Service role not available — use RLS to check if a profile exists and only insert if missing
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
                  '[api/auth/signin] fallback profile insert error',
                  insErr,
                )
            }
          } catch (e) {
            console.log(
              '[api/auth/signin] fallback profile check/insert error',
              e,
            )
          }
        }
      } catch (e) {
        console.log('[api/auth/signin] profile upsert exception', e)
      }
    }

    return res
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 })
  }
}
