import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'
import { normalizeAdminCommunityPost } from '../route'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const payload = await normalizeAdminCommunityPost(body, admin.authUser.id)

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('community_posts')
      .update(payload)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ post: data })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to update community post' },
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
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = getServiceClient()
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to delete community post' },
      { status: 500 },
    )
  }
}
