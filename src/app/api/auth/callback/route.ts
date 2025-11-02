import { NextResponse } from 'next/server'
import { createRouteHandlerServerClient } from '@/utils/supabase-server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?message=No code provided', url.origin),
    )
  }

  const res = NextResponse.redirect(new URL('/', url.origin))
  const supabase = createRouteHandlerServerClient(res)

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] error exchanging code', error)
    return NextResponse.redirect(
      new URL('/login?message=Auth error', url.origin),
    )
  }

  // Optional: ensure profile exists (same logic as signin route)
  // ...existing code from your signin route to upsert profile...

  return res
}
