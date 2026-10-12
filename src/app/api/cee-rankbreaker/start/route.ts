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
    const { error } = await getServiceClient().rpc(
      'cee_rankbreaker_start_attempt',
      { p_attempt_id: attemptId },
    )
    if (error) throw error
    return NextResponse.json(await readRankbreakerState(attemptId))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not start exam.' },
      { status: 409 },
    )
  }
}
