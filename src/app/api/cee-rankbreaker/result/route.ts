import { NextResponse } from 'next/server'
import { getServiceClient } from '@/utils/supabase-server'
import { rankbreakerAttemptIdFromRequest } from '@/lib/rankbreaker-server'

export async function GET(req: Request) {
  const attemptId = rankbreakerAttemptIdFromRequest(req)
  if (!attemptId)
    return NextResponse.json(
      { error: 'Exam session not found.' },
      { status: 401 },
    )
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('cee_rankbreaker_attempts')
    .select(
      'id, edition_id, participant_name, status, correct_count, incorrect_count, unanswered_count, net_marks, accuracy, completion_seconds, subject_performance, cee_rankbreaker_editions!inner(name, review_released)',
    )
    .eq('id', attemptId)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ result: data })
}
