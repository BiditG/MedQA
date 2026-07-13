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
    const { data, error } = await supabase
      .from('community_replies')
      .select('*')
      .eq('post_id', params.id)
      .order('is_verified_answer', { ascending: false })
      .order('upvote_count', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ replies: data || [] })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load replies' },
      { status: 500 },
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const profile = await ensureProfile(user.id, user.email)
    const body = await req.json().catch(() => ({}))
    const text = String(body.body || '').trim()
    if (!text)
      return NextResponse.json({ error: 'Reply is required' }, { status: 400 })

    const supabase = getServiceClient()
    const { data: post, error: postError } = await supabase
      .from('community_posts')
      .select('status')
      .eq('id', params.id)
      .maybeSingle()

    if (postError) throw postError
    if (!post)
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    if (post.status === 'closed') {
      return NextResponse.json(
        { error: 'This discussion is closed' },
        { status: 403 },
      )
    }

    const { data, error } = await supabase
      .from('community_replies')
      .insert({
        post_id: params.id,
        author_id: user.id,
        author_name:
          profile?.name ||
          user.user_metadata?.full_name ||
          user.email ||
          'Student',
        body: text,
        is_admin_reply: isModeratorRole(profile?.role),
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ reply: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to reply' },
      { status: 500 },
    )
  }
}
