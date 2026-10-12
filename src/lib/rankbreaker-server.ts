import { cookies } from 'next/headers'
import { getServiceClient } from '@/utils/supabase-server'
import { verifyRankbreakerSession } from './rankbreaker'

export function rankbreakerAttemptIdFromRequest(req: Request) {
  const cookie = req.headers
    .get('cookie')
    ?.match(/(?:^|;\s*)cee_rankbreaker_token=([^;]+)/)?.[1]
  return (
    verifyRankbreakerSession(cookie ? decodeURIComponent(cookie) : undefined)
      ?.attemptId || null
  )
}

export function rankbreakerAttemptIdFromCookies() {
  return (
    verifyRankbreakerSession(cookies().get('cee_rankbreaker_token')?.value)
      ?.attemptId || null
  )
}

export async function readRankbreakerState(attemptId: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase.rpc(
    'cee_rankbreaker_reconcile_attempt',
    { p_attempt_id: attemptId },
  )
  if (error) throw error
  const state = data as {
    status: string
    position: number
    questionId: string | null
    deadlineAt: string | null
    startedAt: string | null
  }
  const { data: attempt, error: attemptError } = await supabase
    .from('cee_rankbreaker_attempts')
    .select(
      'id, edition_id, participant_name, status, current_position, current_question_id, question_deadline_at, started_at, submitted_at, correct_count, incorrect_count, unanswered_count, net_marks, accuracy, completion_seconds, subject_performance',
    )
    .eq('id', attemptId)
    .single()
  if (attemptError) throw attemptError
  let question: any = null
  let selectedAnswer: string | null = null
  if (state.status === 'started' && state.questionId) {
    const [{ data: q, error: qError }, { data: answer, error: answerError }] =
      await Promise.all([
        supabase
          .from('cee_rankbreaker_questions')
          .select(
            'id, position, subject, chapter, topic, question, option_a, option_b, option_c, option_d',
          )
          .eq('id', state.questionId)
          .single(),
        supabase
          .from('cee_rankbreaker_answers')
          .select('selected_answer')
          .eq('attempt_id', attemptId)
          .eq('question_id', state.questionId)
          .maybeSingle(),
      ])
    if (qError || answerError) throw qError || answerError
    question = q
    selectedAnswer = answer?.selected_answer || null
  }
  return { attempt, state, question, selectedAnswer }
}
