import { NextResponse } from 'next/server'
import { getServiceClient } from '@/utils/supabase-server'
import {
  rankbreakerAttemptIdFromRequest,
  readRankbreakerState,
} from '@/lib/rankbreaker-server'

export async function POST(req: Request) {
  const attemptId = rankbreakerAttemptIdFromRequest(req)
  if (!attemptId)
    return NextResponse.json(
      { error: 'Exam session not found.' },
      { status: 401 },
    )
  try {
    const body = await req.json()
    const answer =
      body?.answer === null ? null : String(body?.answer || '').toUpperCase()
    if (answer !== null && !['A', 'B', 'C', 'D'].includes(answer))
      return NextResponse.json({ error: 'Invalid answer.' }, { status: 400 })
    const { error } = await getServiceClient().rpc(
      'cee_rankbreaker_save_answer',
      {
        p_attempt_id: attemptId,
        p_question_id: String(body?.questionId || ''),
        p_answer: answer,
      },
    )
    if (error)
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('deadline') ? 409 : 400 },
      )
    return NextResponse.json(await readRankbreakerState(attemptId))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not save answer.' },
      { status: 500 },
    )
  }
}
