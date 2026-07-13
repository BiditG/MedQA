import { NextResponse } from 'next/server'
import { isModeratorRole } from '@/lib/community'
import {
  ensureProfile,
  getServiceClient,
  getUserFromRequest,
} from '@/utils/supabase-server'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const profile = await ensureProfile(user.id, user.email)
    if (!isModeratorRole(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const supabase = getServiceClient()
    const payload: Record<string, boolean> = {}
    if (typeof body.isVerifiedAnswer === 'boolean') {
      payload.is_verified_answer = body.isVerifiedAnswer
    }

    if (payload.is_verified_answer) {
      const { data: reply } = await supabase
        .from('community_replies')
        .select('post_id')
        .eq('id', params.id)
        .single()
      if (reply?.post_id) {
        await supabase
          .from('community_replies')
          .update({ is_verified_answer: false })
          .eq('post_id', reply.post_id)
        await supabase
          .from('community_posts')
          .update({ status: 'answered', is_verified_by_medqas: true })
          .eq('id', reply.post_id)
      }
    }

    const { data, error } = await supabase
      .from('community_replies')
      .update(payload)
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ reply: data })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to update reply' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const profile = await ensureProfile(user.id, user.email)
    const supabase = getServiceClient()
    const { data: reply, error: loadError } = await supabase
      .from('community_replies')
      .select('author_id,is_verified_answer')
      .eq('id', params.id)
      .maybeSingle()

    if (loadError) throw loadError
    if (!reply)
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 })

    const canDelete =
      isModeratorRole(profile?.role) ||
      (reply.author_id === user.id && !reply.is_verified_answer)
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('community_replies')
      .delete()
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to delete reply' },
      { status: 500 },
    )
  }
}
