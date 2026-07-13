import { NextResponse } from 'next/server'
import { getServiceClient, getUserFromRequest } from '@/utils/supabase-server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { user } = await getUserFromRequest(req)
    const body = await req.json().catch(() => ({}))
    const supabase = getServiceClient()
    const { error } = await supabase.from('community_reports').insert({
      reporter_id: user?.id || null,
      reply_id: params.id,
      reason: String(body.reason || 'Needs moderator review').slice(0, 500),
    })
    if (error) throw error
    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to report reply' },
      { status: 500 },
    )
  }
}
