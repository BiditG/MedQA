import { NextResponse } from 'next/server'
import { createRouteHandlerServerClient } from '@/utils/supabase-server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const supabase = createRouteHandlerServerClient(res)
  await supabase.auth.signOut()
  return res
}
