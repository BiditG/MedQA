import { NextResponse } from 'next/server'
import { getServiceClient } from '@/utils/supabase-server'
import { rankbreakerAttemptIdFromRequest } from '@/lib/rankbreaker-server'

export async function GET(req: Request) {
  try {
    const params = new URL(req.url).searchParams
    const page = Math.max(1, Number(params.get('page') || 1))
    const pageSize = Math.min(
      100,
      Math.max(1, Number(params.get('pageSize') || 25)),
    )
    const supabase = getServiceClient()
    let editionId = params.get('editionId')
    if (!editionId) {
      const { data: edition, error } = await supabase
        .from('cee_rankbreaker_editions')
        .select('id, name')
        .in('status', ['published', 'closed'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      editionId = edition?.id || null
    }
    if (!editionId)
      return NextResponse.json({
        edition: null,
        rows: [],
        page,
        pageSize,
        total: 0,
      })
    const [{ data: edition, error: editionError }, { data, error }] =
      await Promise.all([
        supabase
          .from('cee_rankbreaker_editions')
          .select('id, name')
          .eq('id', editionId)
          .single(),
        supabase
          .from('cee_rankbreaker_attempts')
          .select(
            'id, participant_name, net_marks, accuracy, completion_seconds, submitted_at',
          )
          .eq('edition_id', editionId)
          .eq('status', 'finalized')
          .order('net_marks', { ascending: false })
          .order('accuracy', { ascending: false })
          .order('completion_seconds', { ascending: true })
          .order('submitted_at', { ascending: true }),
      ])
    if (editionError || error) throw editionError || error
    let previous = ''
    let rank = 0
    const ranked = (data || []).map((row: any, index) => {
      const key = `${row.net_marks}|${row.accuracy}|${row.completion_seconds}`
      if (key !== previous) {
        rank = index + 1
        previous = key
      }
      return {
        id: row.id,
        rank,
        name: row.participant_name,
        netMarks: Number(row.net_marks),
        accuracy: Number(row.accuracy),
        completionSeconds: Number(row.completion_seconds || 0),
      }
    })
    const start = (page - 1) * pageSize
    return NextResponse.json({
      edition,
      rows: ranked.slice(start, start + pageSize),
      page,
      pageSize,
      total: ranked.length,
      currentAttemptId: rankbreakerAttemptIdFromRequest(req),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not load ranking.' },
      { status: 500 },
    )
  }
}
