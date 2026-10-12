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
  const { data: attempt, error } = await supabase
    .from('cee_rankbreaker_attempts')
    .select(
      'edition_id, status, cee_rankbreaker_editions!inner(review_released)',
    )
    .eq('id', attemptId)
    .single()
  if (error || !attempt)
    return NextResponse.json({ error: 'Attempt not found.' }, { status: 404 })
  const edition: any = Array.isArray(attempt.cee_rankbreaker_editions)
    ? attempt.cee_rankbreaker_editions[0]
    : attempt.cee_rankbreaker_editions
  if (attempt.status !== 'finalized' || !edition?.review_released)
    return NextResponse.json(
      { error: 'Detailed review has not been released.' },
      { status: 403 },
    )
  const [{ data: questions, error: qError }, { data: answers, error: aError }] =
    await Promise.all([
      supabase
        .from('cee_rankbreaker_questions')
        .select(
          'id, position, subject, question, option_a, option_b, option_c, option_d, answer, explanation',
        )
        .eq('edition_id', attempt.edition_id)
        .order('position'),
      supabase
        .from('cee_rankbreaker_answers')
        .select('question_id, selected_answer')
        .eq('attempt_id', attemptId),
    ])
  if (qError || aError)
    return NextResponse.json(
      { error: (qError || aError)?.message },
      { status: 500 },
    )
  const selected = new Map(
    (answers || []).map((answer: any) => [
      answer.question_id,
      answer.selected_answer,
    ]),
  )
  return NextResponse.json({
    review: (questions || []).map((question: any) => ({
      ...question,
      selected_answer: selected.get(question.id) || null,
    })),
  })
}
