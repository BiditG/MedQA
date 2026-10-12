import { NextResponse } from 'next/server'
import {
  rankbreakerAttemptIdFromRequest,
  readRankbreakerState,
} from '@/lib/rankbreaker-server'

export async function GET(req: Request) {
  const attemptId = rankbreakerAttemptIdFromRequest(req)
  if (!attemptId)
    return NextResponse.json(
      { error: 'Exam session not found.' },
      { status: 401 },
    )
  try {
    return NextResponse.json(await readRankbreakerState(attemptId))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not load exam.' },
      { status: 500 },
    )
  }
}
