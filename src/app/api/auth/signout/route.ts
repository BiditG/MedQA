// src/app/api/auth/signout/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  // Create Supabase client for server-side with App Router
  const supabase = createRouteHandlerClient({ cookies })

  // Sign out and clear cookies
  await supabase.auth.signOut()

  // Redirect user to home page after sign-out
  return NextResponse.redirect('/')
}
