import { NextResponse } from 'next/server'
import { getUserCommunityActivity } from '@/lib/community'
import { getUserFromRequest } from '@/utils/supabase-server'

export async function GET(req: Request) {
  try {
    const { user } = await getUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    const activity = await getUserCommunityActivity(user.id)
    return NextResponse.json(activity)
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load activity' },
      { status: 500 },
    )
  }
}
