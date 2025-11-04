import { NextResponse } from 'next/server'
import { createRouteHandlerServerClient } from '@/utils/supabase-server' // use your util

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
  const supabase = createRouteHandlerServerClient(res) // your util should set cookies on res

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(
      new URL('/login?message=Auth error', url.origin),
    )
  }

  return res
}
