import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key)
      return NextResponse.json(
        { error: 'service role key not configured' },
        { status: 500 },
      )

    const svc = createClient(url, key, { auth: { persistSession: false } })
    const q = new URL(req.url).searchParams
    const id = q.get('id')
    if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

    const { data, error, status } = await svc
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error)
      return NextResponse.json(
        { error: error.message || String(error), status },
        { status: status ?? 500 },
      )
    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
