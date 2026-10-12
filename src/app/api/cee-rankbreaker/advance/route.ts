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
    if (
      !Number.isInteger(body?.position) ||
      !/^[0-9a-f-]{36}$/i.test(String(body?.requestId || ''))
    )
      return NextResponse.json(
        { error: 'Invalid advance request.' },
        { status: 400 },
      )
    const { error } = await getServiceClient().rpc(
      'cee_rankbreaker_advance_attempt',
      {
        p_attempt_id: attemptId,
        p_expected_position: body.position,
        p_request_id: body.requestId,
      },
    )
    if (error)
      return NextResponse.json({ error: error.message }, { status: 409 })
    return NextResponse.json(await readRankbreakerState(attemptId))
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Could not advance.' },
      { status: 500 },
    )
  }
}
