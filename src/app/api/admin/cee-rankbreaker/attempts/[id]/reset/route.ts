import { NextResponse } from 'next/server'
import {
  getServiceClient,
  requireAdminFromRequest,
} from '@/utils/supabase-server'

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  if (!(await requireAdminFromRequest(req)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const body = await req.json().catch(() => ({}))
    if (body.confirm !== true)
      return NextResponse.json(
        { error: 'Explicit confirmation is required.' },
        { status: 400 },
      )
    const supabase = getServiceClient()
    const { error: answersError } = await supabase
      .from('cee_rankbreaker_answers')
      .delete()
      .eq('attempt_id', params.id)
    if (answersError) throw answersError
    const { data, error } = await supabase
      .from('cee_rankbreaker_attempts')
      .update({
        status: 'registered',
        reset_at: new Date().toISOString(),
        current_position: 1,
        current_question_id: null,
        question_started_at: null,
        question_deadline_at: null,
        started_at: null,
        submitted_at: null,
        completion_seconds: null,
        correct_count: 0,
        incorrect_count: 0,
        unanswered_count: 200,
        net_marks: 0,
        accuracy: 0,
        subject_performance: {},
      })
      .eq('id', params.id)
      .select('id, status, reset_at')
      .single()
    if (error) throw error
    return NextResponse.json({ attempt: data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not reset attempt.' },
      { status: 400 },
    )
  }
}
