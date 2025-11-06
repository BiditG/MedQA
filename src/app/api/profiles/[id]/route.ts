import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const id = params.id
    const body = await req.json().catch(() => ({}))
    const updates: any = {}
    if (body.email) updates.email = String(body.email)
    if (body.role) updates.role = String(body.role)
    const svc = getServiceClient()
    // If email needs to change, update auth as well
    if (updates.email) {
      await svc.auth.admin.updateUserById(id, { email: updates.email })
    }
    if (Object.keys(updates).length > 0) {
      const { error } = await svc.from('profiles').update(updates).eq('id', id)
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (body.password) {
      const { error } = await svc.auth.admin.updateUserById(id, {
        password: String(body.password),
      })
      if (error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const id = params.id
    const svc = getServiceClient()
    await svc.from('profiles').delete().eq('id', id)
    await svc.auth.admin.deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Server error' },
      { status: 500 },
    )
  }
}
