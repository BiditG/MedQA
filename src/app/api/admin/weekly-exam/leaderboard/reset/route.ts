import { NextResponse } from 'next/server'
import supabase from '@/lib/supabaseAdmin'
import { requireAdminFromRequest } from '@/utils/supabase-server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const admin = await requireAdminFromRequest(req)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('weekly_exam_results')
      .update({
        is_reset: true,
        reset_at: new Date().toISOString(),
      })
      .eq('is_reset', false)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to reset leaderboard' },
      { status: 500 },
    )
  }
}
