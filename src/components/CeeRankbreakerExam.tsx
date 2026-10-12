'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type State = any
function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(
    Math.max(0, seconds % 60),
  ).padStart(2, '0')}`
}

export default function CeeRankbreakerExam() {
  const [data, setData] = useState<State | null>(null),
    [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now()),
    [saving, setSaving] = useState(false),
    [connection, setConnection] = useState('Connecting…')
  const [result, setResult] = useState<any>(null),
    [rank, setRank] = useState<number | null>(null),
    [rankedCount, setRankedCount] = useState<number | null>(null),
    [review, setReview] = useState<any[] | null>(null)
  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/cee-rankbreaker/session', {
        cache: 'no-store',
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error)
      setData(json)
      setConnection('Connected')
      setError(null)
      return json
    } catch (err: any) {
      setConnection('Reconnecting…')
      setError(
        err.message ||
          'Connection lost. Your timer is still running on the server.',
      )
      return null
    }
  }, [])
  const loadResult = useCallback(async () => {
    const response = await fetch('/api/cee-rankbreaker/result', {
      cache: 'no-store',
    })
    const json = await response.json()
    if (response.ok) {
      setResult(json.result)
      const board = await fetch(
        '/api/cee-rankbreaker/leaderboard?pageSize=100',
        { cache: 'no-store' },
      ).then((r) => r.json())
      setRank(
        board.rows?.find((row: any) => row.id === json.result.id)?.rank ?? null,
      )
      setRankedCount(Number(board.total || 0))
    }
  }, [])
  useEffect(() => {
    load().then((next) => {
      if (next?.state?.status === 'finalized') loadResult()
    })
  }, [load, loadResult])
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    const reconcile = setInterval(
      () =>
        load().then((next) => {
          if (next?.state?.status === 'finalized') loadResult()
        }),
      10_000,
    )
    return () => {
      clearInterval(timer)
      clearInterval(reconcile)
    }
  }, [load, loadResult])
  const secondsLeft = useMemo(
    () =>
      data?.state?.deadlineAt
        ? Math.max(
            0,
            Math.ceil((Date.parse(data.state.deadlineAt) - now) / 1000),
          )
        : 0,
    [data, now],
  )
  useEffect(() => {
    if (data?.state?.status === 'started' && secondsLeft === 0)
      load().then((next) => {
        if (next?.state?.status === 'finalized') loadResult()
      })
  }, [secondsLeft, data?.state?.status, load, loadResult])
  async function start() {
    setSaving(true)
    try {
      const response = await fetch('/api/cee-rankbreaker/start', {
        method: 'POST',
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error)
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }
  async function save(answer: string | null) {
    if (!data?.question || saving) return
    setSaving(true)
    setData((value: any) => ({ ...value, selectedAnswer: answer }))
    try {
      const response = await fetch('/api/cee-rankbreaker/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: data.question.id, answer }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error)
      setData(json)
    } catch (err: any) {
      setError(err.message)
      await load()
    } finally {
      setSaving(false)
    }
  }
  async function advance() {
    if (!data || saving) return
    setSaving(true)
    try {
      const response = await fetch('/api/cee-rankbreaker/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: data.state.position,
          requestId: crypto.randomUUID(),
        }),
      })
      const json = await response.json()
      if (!response.ok) throw new Error(json.error)
      setData(json)
      if (json.state?.status === 'finalized') loadResult()
    } catch (err: any) {
      setError(err.message)
      await load()
    } finally {
      setSaving(false)
    }
  }
  async function loadReview() {
    const response = await fetch('/api/cee-rankbreaker/review')
    const json = await response.json()
    if (!response.ok)
      return setError(json.error || 'Detailed review is unavailable.')
    setReview(json.review || [])
  }
  if (!data && !error)
    return (
      <main className="mx-auto max-w-3xl p-8">
        Loading secure exam session…
      </main>
    )
  if (!data)
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-red-700">{error}</p>
        <Link className="vibrant-btn mt-4 inline-flex" href="/cee-rankbreaker">
          Return to CEE Rankbreaker
        </Link>
      </main>
    )
  if (result || data.state?.status === 'finalized') {
    const edition: any = Array.isArray(result?.cee_rankbreaker_editions)
      ? result.cee_rankbreaker_editions[0]
      : result?.cee_rankbreaker_editions
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="rounded-xl border bg-card p-6">
          <h1 className="text-3xl font-semibold">CEE Rankbreaker results</h1>
          {result ? (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ['Net marks', `${Number(result.net_marks).toFixed(2)} / 200`],
                  ['Accuracy', `${Number(result.accuracy).toFixed(2)}%`],
                  [
                    'Ranking',
                    rank ? `#${rank} of ${rankedCount ?? '…'}` : 'Calculating…',
                  ],
                  ['Correct', result.correct_count],
                  ['Incorrect', result.incorrect_count],
                  ['Unanswered', result.unanswered_count],
                  ['Completion time', duration(result.completion_seconds || 0)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="mt-1 text-lg font-semibold">{value}</div>
                  </div>
                ))}
              </div>
              <h2 className="mt-7 text-lg font-semibold">
                Subject-wise performance
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {Object.entries(result.subject_performance || {}).map(
                  ([subject, value]: any) => (
                    <div key={subject} className="rounded-lg border p-3">
                      <strong>{subject}</strong>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Correct: {value.correct} · Incorrect: {value.incorrect}{' '}
                        · Unanswered: {value.unanswered} ·{' '}
                        {Number(value.marks).toFixed(2)} marks
                      </p>
                    </div>
                  ),
                )}
              </div>
              {edition?.review_released && (
                <button
                  onClick={loadReview}
                  className="mt-6 rounded border px-4 py-2 text-sm font-semibold"
                >
                  View released detailed review
                </button>
              )}
              {review && (
                <div className="mt-5 max-h-[500px] space-y-3 overflow-auto">
                  {review.map((item) => (
                    <article
                      key={item.id}
                      className="rounded border p-3 text-sm"
                    >
                      <strong>
                        {item.position}. {item.question}
                      </strong>
                      <p className="mt-1">
                        Your answer: {item.selected_answer || '—'} · Correct:{' '}
                        {item.answer}
                      </p>
                      {item.explanation && (
                        <p className="mt-1 text-muted-foreground">
                          {item.explanation}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
              <Link
                href="/cee-rankbreaker/leaderboard"
                className="vibrant-btn mt-6 inline-flex"
              >
                View CEE Rankbreaker ranking
              </Link>
            </>
          ) : (
            <p className="mt-4">Finalizing your result…</p>
          )}
        </section>
      </main>
    )
  }
  if (data.state?.status === 'registered')
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="rounded-xl border bg-card p-6">
          <h1 className="text-3xl font-semibold">Exam rules</h1>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>
              200 questions, one minute per question, and no return to a locked
              question.
            </li>
            <li>Correct: +1; incorrect: −0.25; unanswered: 0.</li>
            <li>
              Your timer is controlled by the server. Refreshing or
              disconnecting does not pause it.
            </li>
            <li>
              Answers and explanations are unavailable until an administrator
              releases review.
            </li>
          </ul>
          <button
            onClick={start}
            disabled={saving}
            className="vibrant-btn mt-6"
          >
            {saving ? 'Starting…' : 'Start Exam'}
          </button>
        </section>
      </main>
    )
  const question = data.question
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex justify-between text-sm">
        <span>Question {data.state.position}/200</span>
        <span className="font-mono font-semibold">{duration(secondsLeft)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-muted">
        <div
          className="h-full bg-primary"
          style={{ width: `${data.state.position / 2}%` }}
        />
      </div>
      <section className="mt-5 rounded-xl border bg-card p-6">
        <div className="text-sm text-muted-foreground">
          {question.subject} · {question.chapter} · {question.topic}
        </div>
        <h1 className="mt-3 text-xl font-semibold leading-8">
          {question.question}
        </h1>
        <div className="mt-6 grid gap-3">
          {['A', 'B', 'C', 'D'].map((letter) => (
            <button
              key={letter}
              disabled={saving}
              onClick={() => save(letter)}
              className={`rounded-lg border p-4 text-left text-sm ${
                data.selectedAnswer === letter
                  ? 'border-primary bg-primary/10'
                  : 'hover:bg-muted/50'
              }`}
            >
              <b className="mr-3">{letter}.</b>
              {question[`option_${letter.toLowerCase()}`]}
            </button>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            disabled={saving || !data.selectedAnswer}
            onClick={() => save(null)}
            className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
          >
            Clear selection
          </button>
          <button disabled={saving} onClick={advance} className="vibrant-btn">
            {saving
              ? 'Saving…'
              : data.state.position === 200
                ? 'Finish exam'
                : 'Save & Next'}
          </button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {connection}
          {saving ? ' · Saving selection…' : ''}
        </p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </section>
    </main>
  )
}
