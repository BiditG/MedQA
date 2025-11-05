// middleware.ts — no-op
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * No-op middleware: allow all requests through.
 * Access control is handled client-side and via server API protections.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
