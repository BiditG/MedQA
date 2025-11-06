import { NextResponse } from 'next/server'

// OAuth callback removed. Redirect with a helpful message.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const redirectTo = url.searchParams.get('redirectTo') || '/'
  return NextResponse.redirect(
    new URL(
      `/login?message=OAuth%20sign-in%20disabled&redirectTo=${encodeURIComponent(
        redirectTo,
      )}`,
      url.origin,
    ),
  )
}
