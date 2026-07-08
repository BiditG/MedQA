import { NextResponse } from 'next/server'
import supabase from '@/lib/supabaseAdmin'
import { verifyExamToken } from '@/lib/examAuth'
import { verifyExamCode } from '@/lib/examCodes'

export const runtime = 'nodejs'

type LeaderboardWindow = '24h' | '7d' | 'lifetime'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const window = normalizeWindow(searchParams.get('window'))
    const since = getSinceIso(window)

    let query = supabase
      .from('weekly_exam_results')
      .select(
        'id, participant_name, anonymous, total_score, biology_score, correct_count, wrong_count, unanswered_count, total_questions, submitted_at',
      )
      .eq('is_reset', false)
      .order('total_score', { ascending: false })
      .order('biology_score', { ascending: false })
      .order('submitted_at', { ascending: true })
      .limit(50)

    if (since) query = query.gte('submitted_at', since)

    const { data, error } = await query
    if (error) throw error

    const results = (data || []).map((row: any, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.anonymous ? 'Anonymous' : row.participant_name || 'Student',
      anonymous: Boolean(row.anonymous),
      totalScore: Number(row.total_score || 0),
      biologyScore: Number(row.biology_score || 0),
      correctCount: Number(row.correct_count || 0),
      wrongCount: Number(row.wrong_count || 0),
      unansweredCount: Number(row.unanswered_count || 0),
      totalQuestions: Number(row.total_questions || 0),
      submittedAt: row.submitted_at,
    }))

    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to load leaderboard' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const cookie = req.headers
      .get('cookie')
      ?.split(/;\s*/)
      .find((item) => item.startsWith('weekly_exam_token='))
    const token = cookie ? decodeURIComponent(cookie.split('=')[1] || '') : ''
    const payload = token ? verifyExamToken(token) : null
    if (!payload) {
      return NextResponse.json(
        { error: 'Exam session expired' },
        { status: 401 },
      )
    }

    const codeResult = await verifyExamCode(payload.code)
    if (!codeResult.ok || !codeResult.code) {
      return NextResponse.json({ error: 'Invalid exam code' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const totalScore = toNumber(body.totalScore)
    const biologyScore = toNumber(body.biologyScore)
    const totalQuestions = Math.max(
      0,
      Math.trunc(toNumber(body.totalQuestions)),
    )
    const answeredCount = Math.max(0, Math.trunc(toNumber(body.answeredCount)))
    const correctCount = Math.max(0, Math.trunc(toNumber(body.correctCount)))
    const wrongCount = Math.max(0, Math.trunc(toNumber(body.wrongCount)))
    const unansweredCount = Math.max(
      0,
      Math.trunc(
        body.unansweredCount === undefined
          ? totalQuestions - answeredCount
          : toNumber(body.unansweredCount),
      ),
    )

    const participantName =
      sanitizeName(payload.name) ||
      sanitizeName(body.participantName) ||
      'Student'

    const { data, error } = await supabase
      .from('weekly_exam_results')
      .insert({
        exam_code_id: codeResult.code.id,
        exam_code: codeResult.code.code,
        participant_name: participantName,
        anonymous: Boolean(payload.anonymous),
        total_score: totalScore,
        biology_score: biologyScore,
        correct_count: correctCount,
        wrong_count: wrongCount,
        unanswered_count: unansweredCount,
        answered_count: answeredCount,
        total_questions: totalQuestions,
        subject_scores: body.subjectScores || {},
      })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to submit result' },
      { status: 500 },
    )
  }
}

function normalizeWindow(value: string | null): LeaderboardWindow {
  if (value === '24h' || value === '7d' || value === 'lifetime') return value
  return '7d'
}

function getSinceIso(window: LeaderboardWindow) {
  if (window === 'lifetime') return null
  const ms = window === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
  return new Date(Date.now() - ms).toISOString()
}

function toNumber(value: unknown) {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

function sanitizeName(value: unknown) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 80)
}
