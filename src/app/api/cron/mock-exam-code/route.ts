import { NextResponse } from 'next/server'
import {
  assertCronAuthorized,
  expireOldAutomatedMockExamCodes,
  publishDailyMockExamCode,
} from '@/lib/mockExamAutomation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    assertCronAuthorized(req)
    await expireOldAutomatedMockExamCodes()
    const result = await publishDailyMockExamCode()
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    const status = e?.message === 'Unauthorized cron request' ? 401 : 500
    return NextResponse.json(
      { ok: false, error: e?.message || 'Cron failed' },
      { status },
    )
  }
}

export async function POST(req: Request) {
  return GET(req)
}
