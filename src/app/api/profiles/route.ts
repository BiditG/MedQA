import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const svc = getServiceClient()
    const { data, error } = await svc
      .from('profiles')
      .select('id,email,role,created_at,premium')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ users: data || [] })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const body = await req.json().catch(() => ({}))
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '').trim()
    const role = String(body?.role || 'user')
    if (!email || !password)
      return NextResponse.json(
        { error: 'email and password required' },
        { status: 400 },
      )
    const svc = getServiceClient()
    const { data: created, error: createErr } = await svc.auth.admin.createUser(
      {
        email,
        password,
        email_confirm: true,
      },
    )
    if (createErr || !created?.user?.id)
      return NextResponse.json(
        { error: createErr?.message || 'Create failed' },
        { status: 500 },
      )
    const uid = created.user.id
    const { error: upErr } = await svc
      .from('profiles')
      .upsert({ id: uid, email, role })
    if (upErr)
      return NextResponse.json(
        { error: upErr.message || 'Profile upsert failed' },
        { status: 500 },
      )
    return NextResponse.json({ id: uid }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 },
    )
  }
}
