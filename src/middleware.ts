import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase-server'

export async function middleware(request: NextRequest) {
  try {
    // This `try/catch` block is only here for the interactive tutorial.
    // Feel free to remove once you have Supabase connected.
    const { supabase, response } = createMiddlewareClient(request)

    // Refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const url = new URL(request.url)
    const pathname = url.pathname

    // Early allow for static assets and Next internals
    // This replicates the previous matcher exclusions without using capture groups
    const skipPrefixes = [
      '/_next/static',
      '/_next/image',
      '/favicon.ico',
      '/public/',
    ]
    const extSkip = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp']
    if (
      skipPrefixes.some((p) => pathname.startsWith(p)) ||
      extSkip.some((ext) => pathname.endsWith(ext))
    ) {
      return NextResponse.next()
    }

    // Require login for all app routes except public ones
    const publicPaths = new Set([
      '/',
      '/login',
      '/forgot-password',
      '/reset-password',
      '/api/auth/callback',
    ])
    const isPublic = Array.from(publicPaths).some(
      (p) => pathname === p || pathname.startsWith('/api/auth'),
    )

    if (!session && !isPublic) {
      const redirectUrl = new URL('/', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Subscriptions removed: do not block routes based on premium status

    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: { headers: request.headers },
    })
  }
}

export const config = {
  // Match all routes and handle exclusions inside the middleware function.
  matcher: ['/:path*'],
}
