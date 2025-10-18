import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-only debug route. Do NOT expose in production publicly.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id)
    return NextResponse.json(
      { error: 'missing id query param' },
      { status: 400 },
    )

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE config missing on server' },
      { status: 500 },
    )
  }

  const svc = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-debug': 'true' } },
  })

  try {
    const { data, error, status } = await svc
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      console.error('[debug:profiles] supabase error', { id, status, error })
      return NextResponse.json({ error, status }, { status: status ?? 500 })
    }
    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('[debug:profiles] unexpected error', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
