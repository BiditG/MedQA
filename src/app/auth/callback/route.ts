import { NextResponse } from 'next/server'
import { createRouteHandlerServerClient } from '@/utils/supabase-server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const redirectTo = url.searchParams.get('redirectTo') || '/'

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?message=No code provided', url.origin),
    )
  }

  const res = NextResponse.redirect(new URL(redirectTo, url.origin))
  const supabase = createRouteHandlerServerClient(res)

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] error exchanging code', error)
    return NextResponse.redirect(
      new URL('/login?message=Auth error', url.origin),
    )
  }

  // Optional: ensure profile exists
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  }

  return res
}
