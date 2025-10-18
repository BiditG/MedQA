import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/utils/supabase-server'
import { createClient as createDirectClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data: sessionData, error: sessionErr } =
      await supabase.auth.getSession()
    if (sessionErr) {
      console.log('[api/auth/me] getSession error', sessionErr)
      return NextResponse.json(
        { error: sessionErr.message || 'Failed to get session' },
        { status: 500 },
      )
    }

    const session = sessionData.session
    if (!session) return NextResponse.json({ session: null, profile: null })

    const userId = session.user.id

    // Use the service role key to query the profiles table server-side so we can
    // observe and return any DB/PostgREST errors (service role should bypass RLS).
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Prefer service role (bypass RLS) if configured; otherwise fall back to user session with RLS
    if (supabaseUrl && serviceKey) {
      const svc = createDirectClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
      })
      try {
        const {
          data: profile,
          error: profileErr,
          status,
        } = await svc
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        if (profileErr) {
          console.log('[api/auth/me] profiles select error (svc)', {
            status,
            error: profileErr,
          })
        } else {
          // Auto-revoke expired premium if present
          try {
            if (profile?.premium && profile?.premium_expires_at) {
              const expires = new Date(profile.premium_expires_at)
              if (
                isFinite(expires.getTime()) &&
                expires.getTime() <= Date.now()
              ) {
                await svc
                  .from('profiles')
                  .update({ premium: false, premium_expires_at: null })
                  .eq('id', userId)
                profile.premium = false
                profile.premium_expires_at = null
              }
            }
          } catch (e) {
            console.error('[api/auth/me] auto-revoke failed', e)
          }
          return NextResponse.json({ session, profile })
        }
      } catch (err: any) {
        console.error('[api/auth/me] unexpected (svc)', err)
      }
    } else {
      console.log(
        '[api/auth/me] service key not configured, using RLS fallback',
      )
    }

    // Fallback with RLS using the authenticated user session
    try {
      const {
        data: profile,
        error: rlsErr,
        status,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (rlsErr) {
        console.log('[api/auth/me] profiles select error (rls)', {
          status,
          error: rlsErr,
        })
        return NextResponse.json(
          {
            session,
            error: rlsErr.message || 'Failed to read profile',
            status,
          },
          { status: status ?? 500 },
        )
      }
      return NextResponse.json({ session, profile })
    } catch (err: any) {
      console.error('[api/auth/me] unexpected (rls)', err)
      return NextResponse.json({ session, error: String(err) }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[api/auth/me] outer', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
