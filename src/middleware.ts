import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@/utils/supabase-server'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createMiddlewareClient(request)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const url = new URL(request.url)
    const pathname = url.pathname

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

    // make callback public so cookies can be set
    const publicPaths = new Set([
      '/',
      '/login',
      '/reset-password',
      '/auth/callback', // <-- important
      '/api/auth/signin', // allow credentials sign-in
    ])
    const isPublic = Array.from(publicPaths).some(
      (p) =>
        pathname === p ||
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/api/weekly-exam') ||
        pathname.startsWith('/weekly-exam'),
    )

    if (!session && !isPublic) {
      // Redirect to login with a message and return URL
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('message', 'Please sign in to continue')
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (e) {
    return NextResponse.next({
      request: { headers: request.headers },
    })
  }
}

export const config = {
  matcher: ['/:path*'],
}
