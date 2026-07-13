import { NextResponse } from 'next/server'
import { getServiceClient, getUserFromRequest } from '@/utils/supabase-server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user)
      return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const supabase = getServiceClient()
    const { error: voteError } = await supabase
      .from('community_reply_votes')
      .insert({ reply_id: params.id, user_id: user.id })

    if (voteError?.code === '23505') {
      return NextResponse.json(
        { error: 'You already upvoted this reply' },
        { status: 409 },
      )
    }
    if (voteError) throw voteError

    const { data: reply, error: loadError } = await supabase
      .from('community_replies')
      .select('upvote_count')
      .eq('id', params.id)
      .single()
    if (loadError) throw loadError

    const { data, error } = await supabase
      .from('community_replies')
      .update({ upvote_count: (reply?.upvote_count || 0) + 1 })
      .eq('id', params.id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ reply: data })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to upvote reply' },
      { status: 500 },
    )
  }
}
