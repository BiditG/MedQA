import { NextResponse } from 'next/server'
import { isModeratorRole } from '@/lib/community'
import {
  ensureProfile,
  getServiceClient,
  getUserFromRequest,
} from '@/utils/supabase-server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getServiceClient()
    await supabase.rpc('increment_community_post_view', {
      post_id_input: params.id,
    })
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', params.id)
      .maybeSingle()

    if (error) throw error
    if (!data)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    return NextResponse.json({ post: data })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load post' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const profile = await ensureProfile(user.id, user.email)
    const isModerator = isModeratorRole(profile?.role)
    if (!isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const payload: Record<string, boolean | string> = {}
    if (typeof body.isPinned === 'boolean') payload.is_pinned = body.isPinned
    if (typeof body.isFeatured === 'boolean')
      payload.is_featured = body.isFeatured
    if (typeof body.isVerifiedByMedqas === 'boolean') {
      payload.is_verified_by_medqas = body.isVerifiedByMedqas
    }
    if (['open', 'answered', 'closed'].includes(String(body.status))) {
      payload.status = String(body.status)
    }

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
      { error: e?.message || 'Failed to update post' },
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
    const { data: post, error: loadError } = await supabase
      .from('community_posts')
      .select('author_id,status')
      .eq('id', params.id)
      .maybeSingle()

    if (loadError) throw loadError
    if (!post)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const canDelete =
      isModeratorRole(profile?.role) ||
      (post.author_id === user.id && post.status !== 'answered')
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to delete post' },
      { status: 500 },
    )
  }
}
