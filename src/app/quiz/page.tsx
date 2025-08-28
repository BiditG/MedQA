'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/utils/supabase'
import { Button } from '@/components/ui/button'
import { QuizHeader } from './components/QuizHeader'
import { QuestionCard } from './components/QuestionCard'
import { ExplanationPanel } from './components/ExplanationPanel'
import { QuizFooter } from './components/QuizFooter'
import { ScoreSummary } from './components/ScoreSummary'
import { Skeleton } from '@/components/ui/skeleton'
import { Mode } from './components/ModeToggle'
import { Timer } from './components/Timer'
import { ResultsSummary } from './components/ResultsSummary'
import Link from 'next/link'

type Mcq = {
  id: string
  exam: string | null
  subject: string | null
  topic: string | null
  q: string
  options: string[] | string // JSON array or plain string
  answer: string // text or 1-based index string
  explanation: string | null
  year: number | null
}

// Fisher–Yates
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Coerce anything -> string[]
function toArray(x: unknown): string[] {
  if (Array.isArray(x)) return x as string[]
  if (x == null) return []
  if (typeof x === 'string') {
    try {
      const parsed = JSON.parse(x)
      return Array.isArray(parsed) ? parsed : x.trim() ? [x] : []
    } catch {
      return x.trim() ? [x] : []
    }
  }
  return []
}

function getCorrectIndexOrText(answer: string) {
  const trimmed = (answer ?? '').toString().trim()
  const n = Number(trimmed)
  const isInt = Number.isInteger(n) && trimmed === String(n)
  // many datasets store correct option as 1-based index
  return isInt
    ? ({ type: 'index', index: Math.max(0, n - 1) } as const)
    : ({ type: 'text', text: trimmed } as const)
}

function QuizClient() {
  const searchParams = useSearchParams() ?? new URLSearchParams()
  const router = useRouter()

  const initialSubject = searchParams.get('subject') || ''
  const initialTopic = searchParams.get('topic') || ''
  const initialMode = (searchParams.get('mode') as Mode) || 'casual'
  const initialCount = Number(searchParams.get('count') || 10)
  const [subject, setSubject] = useState(initialSubject)
  const [topic, setTopic] = useState(initialTopic)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [countInput, setCountInput] = useState(String(initialCount || 10))
  const count = useMemo(() => {
    const n = Number(countInput || initialCount || 10)
    return Math.max(1, Math.min(50, Number.isFinite(n) ? Math.round(n) : 10))
  }, [countInput, initialCount])
  const [started, setStarted] = useState(Boolean(searchParams.get('started')))

  // Load available subjects and topics from the database so users can pick from lists
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['mcq-subjects'],
    queryFn: async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('mcqs')
        .select('subject')
        .limit(1000)
      if (error) throw error
      const vals = Array.from(
        new Set(
          (data as any[])
            .map((r) => (r.subject ?? '').toString().trim())
            .filter(Boolean),
        ),
      )
      return vals.sort()
    },
    staleTime: 60_000,
  })

  const { data: topicsData, isLoading: topicsLoading } = useQuery({
    queryKey: ['mcq-topics', subject],
    queryFn: async () => {
      const supabase = createBrowserClient()
      let query = supabase.from('mcqs').select('topic').limit(1000)
      if (subject) query = query.eq('subject', subject)
      const { data, error } = await query
      if (error) throw error
      const vals = Array.from(
        new Set(
          (data as any[])
            .map((r) => (r.topic ?? '').toString().trim())
            .filter(Boolean),
        ),
      )
      return vals.sort()
    },
    staleTime: 60_000,
  })

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [revealed, setRevealed] = useState(false) // casual: after an answer; exam: reveal only in review

  // Exam settings (TODO: make configurable via Dialog)
  const marksCorrect = 1
  const marksWrong = -0.25
  const marksSkip = 0
  // duration computed later based on count

  const [examRunning, setExamRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [reviewMode, setReviewMode] = useState(false) // for reviewing mistakes after finish
  const [selections, setSelections] = useState<Array<number | undefined>>([]) // selected index per question

  const { data, isLoading, isError, refetch, error } = useQuery({
    enabled: started,
    queryKey: ['mcqs', { subject, topic, count }],
    queryFn: async () => {
      const supabase = createBrowserClient()
      let query = supabase
        .from('mcqs')
        .select(
          'id, exam, subject, topic, q, options, answer, explanation, year',
        )
        .limit(Math.min(200, count * 5))

      if (subject) query = query.eq('subject', subject)
      if (topic) query = query.eq('topic', topic)

      const { data, error } = await query
      if (error) throw error
      return shuffle((data as Mcq[]) ?? []).slice(0, count)
    },
    staleTime: 60_000,
  })

  const mcqs: Mcq[] = useMemo(() => data ?? [], [data])
  const total = mcqs.length
  const rawCurrent = mcqs[currentIndex]

  // Ensure selections array matches number of questions once data is available
  useEffect(() => {
    if (!started) return
    const desired = Math.max(0, count)
    setSelections((s) => {
      if (s.length === desired) return s
      const next = new Array<number | undefined>(desired).fill(undefined)
      for (let i = 0; i < Math.min(s.length, desired); i++) next[i] = s[i]
      return next
    })
  }, [data, count, started])

  const current = useMemo(() => {
    if (!rawCurrent) return undefined
    return {
      ...rawCurrent,
      options: toArray(rawCurrent.options),
      answerInfo: getCorrectIndexOrText(rawCurrent.answer),
    }
  }, [rawCurrent])

  const isDone = total > 0 && currentIndex >= total

  function onSelect(option: string, idx: number) {
    if (!current) return
    if (mode === 'casual') {
      if (selected) return // one try
      setSelected(option)
      setSelectedIndex(idx)
      setRevealed(true)
      const correct =
        current.answerInfo.type === 'index'
          ? idx === current.answerInfo.index
          : option === current.answerInfo.text
      if (correct) setScore((s) => s + 1)
    } else {
      // exam: store selection immediately, but do not show explanation
      const next = selections.slice()
      next[currentIndex] = idx
      setSelections(next)
      // lock selection for this question by moving to next immediately or allow manual next?
      // We'll allow manual Next so user can change within question until they click Next.
      setSelected(option)
      setSelectedIndex(idx)
    }
  }

  function onNext() {
    if (currentIndex + 1 >= total) {
      if (mode === 'exam') {
        onFinishExam()
      } else {
        setCurrentIndex(total)
      }
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelected(null)
    setSelectedIndex(null)
    setRevealed(false)
  }

  function onRestart() {
    setCurrentIndex(0)
    setSelected(null)
    setSelectedIndex(null)
    setScore(0)
    setRevealed(false)
    setSelections([])
    setFinished(false)
    setReviewMode(false)
    setExamRunning(false)
    refetch()
  }

  // Settings come from Home; keep quiz focused on answering.

  function exportScore() {
    const payload = {
      timestamp: new Date().toISOString(),
      subject: subject || null,
      topic: topic || null,
      total,
      score,
      mode,
      count,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-score-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function onStartFormSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    // update url so users can share settings
    const params = new URLSearchParams({
      ...(subject && { subject }),
      ...(topic && { topic }),
      mode,
      count: String(count),
      started: '1',
    })
    router.replace(`/quiz?${params.toString()}`)
    setStarted(true)
  }

  function goBackToSetup() {
    // keep current filters in the URL but remove 'started' so the setup form shows
    const params = new URLSearchParams({
      ...(subject && { subject }),
      ...(topic && { topic }),
      mode,
      count: String(count),
    })
    router.replace(`/quiz?${params.toString()}`)
    setStarted(false)
    setFinished(false)
    setExamRunning(false)
    setReviewMode(false)
  }

  // Mode change -> persist in URL and reset session
  // Mode is fixed from Home for this session.

  // Exam finish & scoring
  function onFinishExam() {
    setFinished(true)
    setExamRunning(false)
  }

  function computeExamScore() {
    if (!data || data.length === 0)
      return {
        scoreRaw: 0,
        max: 0,
        counts: { correct: 0, wrong: 0, skipped: 0 },
      }
    let scoreRaw = 0
    let correct = 0
    let wrong = 0
    let skipped = 0
    for (let i = 0; i < data.length && i < count; i++) {
      const q = data[i] as Mcq
      const opts = toArray(q.options)
      const ans = getCorrectIndexOrText(q.answer)
      const sel = selections[i]
      if (sel == null) {
        scoreRaw += marksSkip
        skipped++
      } else {
        const isCorrect =
          ans.type === 'index' ? sel === ans.index : opts[sel] === ans.text
        if (isCorrect) {
          scoreRaw += marksCorrect
          correct++
        } else {
          scoreRaw += marksWrong
          wrong++
        }
      }
    }
    const max = (Math.min(data.length, count) || count) * marksCorrect
    return { scoreRaw, max, counts: { correct, wrong, skipped } }
  }

  // Scale exam duration with question count (approx 1.2 min/question)
  const examDurationMs = useMemo(
    () => Math.max(2 * 60_000, Math.round(count * 72_000)),
    [count],
  )

  // Start timer automatically in exam mode when questions arrive
  useEffect(() => {
    if (mode === 'exam' && !examRunning && !finished && total > 0) {
      setExamRunning(true)
    }
  }, [mode, examRunning, finished, total])

  return (
    <div className="w-full px-4 py-8 pb-28">
      <div className="mx-auto box-border w-full max-w-3xl">
        {/* Setup form shown when not started */}
        {!started && (
          <form
            onSubmit={onStartFormSubmit}
            className="rounded-2xl border p-4 sm:p-6"
          >
            <h2 className="mb-2 text-lg font-semibold">Practice MCQs</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose settings for your practice session.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col overflow-hidden text-sm">
                Subject
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    setTopic('')
                  }}
                  className="mt-1 w-full max-w-full appearance-none rounded-md border bg-[url('/chev-down.svg')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2"
                >
                  <option value="">Any subject</option>
                  {subjectsLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    (subjectsData || []).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="flex flex-col overflow-hidden text-sm">
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 w-full max-w-full appearance-none rounded-md border bg-[url('/chev-down.svg')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2"
                  disabled={topicsLoading || !(topicsData && topicsData.length)}
                >
                  <option value="">Any topic</option>
                  {topicsLoading ? (
                    <option disabled>Loading…</option>
                  ) : (
                    (topicsData || []).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  )}
                </select>
              </label>
              <label className="flex flex-col overflow-hidden text-sm">
                Number of questions
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={countInput}
                  onChange={(e) => setCountInput(e.target.value)}
                  className="mt-1 w-full max-w-full rounded-md border px-3 py-2"
                />
              </label>
              <label className="flex flex-col overflow-hidden text-sm">
                Mode
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  className="mt-1 rounded-md border px-3 py-2"
                >
                  <option value="casual">Casual (immediate feedback)</option>
                  <option value="exam">Exam (no feedback)</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" className="w-full sm:w-auto">
                Start practice
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSubject('')
                  setTopic('')
                  setCountInput('10')
                  setMode('casual')
                }}
                className="w-full sm:w-auto"
              >
                Reset
              </Button>
            </div>
          </form>
        )}
        <div className="mb-4 flex items-center justify-between">
          <QuizHeader
            index={currentIndex}
            total={total || count}
            score={mode === 'casual' ? score : 0}
          />
          <div className="flex items-center gap-3 text-sm">
            {mode === 'exam' && (
              <div className="rounded-full border px-3 py-1">
                Time:{' '}
                <Timer
                  durationMs={examDurationMs}
                  running={examRunning && !finished}
                  onExpire={onFinishExam}
                />
              </div>
            )}
            <span className="hidden text-muted-foreground sm:inline">
              {subject || 'Any subject'}
              {topic ? ` • ${topic}` : ''} • {count} q
            </span>
            <Link
              href={`/?${new URLSearchParams({
                ...(subject && { subject }),
                ...(topic && { topic }),
                mode,
                count: String(count),
              }).toString()}`}
              className="underline-offset-2 hover:underline"
            >
              Adjust
            </Link>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        )}

        {/* Empty */}
        {isError && (
          <div className="rounded-2xl border p-6 text-sm">
            <p className="font-medium text-rose-500">
              We couldn’t load questions.
            </p>
            <p className="text-muted-foreground">{String(error)}</p>
            <div className="mt-4">
              <Button asChild>
                <Link
                  href={`/?${new URLSearchParams({
                    ...(subject && { subject }),
                    ...(topic && { topic }),
                    mode,
                    count: String(count),
                  }).toString()}`}
                >
                  Adjust filters
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && total === 0 && (
          <div className="rounded-2xl border p-6 text-center">
            <div className="mb-2 text-2xl">📚</div>
            <p className="text-muted-foreground">
              No questions found. Try adjusting filters.
            </p>
          </div>
        )}

        {/* Quiz */}
        {!isLoading &&
          !isError &&
          total > 0 &&
          !finished &&
          !isDone &&
          current && (
            <>
              <QuestionCard
                exam={current.exam}
                subject={current.subject}
                topic={current.topic}
                year={current.year}
                q={current.q}
                options={current.options as string[]}
                answerInfo={current.answerInfo}
                selected={selected}
                selectedIndex={selectedIndex}
                onSelect={onSelect}
              />

              {/* Casual vs Exam feedback */}
              {mode === 'casual' ? (
                <>
                  <div
                    className="mt-3 text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    {selected
                      ? (() => {
                          const correct =
                            current.answerInfo.type === 'index'
                              ? selected ===
                                (current.options as string[])[
                                  current.answerInfo.index
                                ]
                              : selected === current.answerInfo.text
                          return correct
                            ? 'Great choice! ✅'
                            : 'Close — here’s why…'
                        })()
                      : 'Pick the best answer to continue.'}
                  </div>
                  <ExplanationPanel
                    text={revealed ? current.explanation : null}
                  />
                </>
              ) : null}

              <QuizFooter
                index={currentIndex}
                total={total}
                canNext={mode === 'exam' ? true : !!selected}
                onNext={onNext}
              />
            </>
          )}

        {/* Casual Results */}
        {!isLoading && !isError && isDone && mode === 'casual' && (
          <div>
            <ScoreSummary
              score={score}
              total={total}
              onRestart={onRestart}
              onExport={exportScore}
            />
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={goBackToSetup}>
                Back to setup
              </Button>
            </div>
          </div>
        )}

        {/* Exam Results */}
        {!isLoading &&
          !isError &&
          (finished || (isDone && mode === 'exam')) &&
          mode === 'exam' &&
          (() => {
            const { scoreRaw, max, counts } = computeExamScore()
            return (
              <div>
                <ResultsSummary
                  score={scoreRaw}
                  max={max}
                  breakdown={counts}
                  onRetry={onRestart}
                  onReview={() => setReviewMode(true)}
                  onExport={exportScore}
                />
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" onClick={goBackToSetup}>
                    Back to setup
                  </Button>
                </div>
              </div>
            )
          })()}
        {/* Review mode: show all questions with selections and explanations */}
        {reviewMode && (
          <div className="mt-6 space-y-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Review answers</h3>
              <div className="flex gap-2">
                <Button onClick={() => setReviewMode(false)}>
                  Back to results
                </Button>
                <Button variant="ghost" onClick={onRestart}>
                  Restart
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {mcqs.map((q, i) => {
                const opts = toArray(q.options)
                const sel = selections[i]
                const selectedText = sel == null ? null : opts[sel]
                const ans = getCorrectIndexOrText(q.answer)
                const answerIdx =
                  ans.type === 'index'
                    ? ans.index
                    : opts.findIndex((o) => o === ans.text)
                return (
                  <div key={q.id}>
                    <QuestionCard
                      exam={q.exam}
                      subject={q.subject}
                      topic={q.topic}
                      year={q.year}
                      q={q.q}
                      options={opts}
                      answerInfo={ans}
                      selected={selectedText}
                      onSelect={() => {}}
                    />
                    <ExplanationPanel text={q.explanation} />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="w-full max-w-3xl px-4 py-8">Loading…</div>}
    >
      <QuizClient />
    </Suspense>
  )
}
