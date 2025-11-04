'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { QuestionCard } from '@/app/quiz/components/QuestionCard'
import { ExplanationPanel } from '@/app/quiz/components/ExplanationPanel'
import { Button } from '@/components/ui/button'
import { Timer } from '@/app/quiz/components/Timer'

type MCQ = {
  id: string
  subject: string
  chapter?: string
  topic?: string
  question: string
  optionA?: string
  optionB?: string
  optionC?: string
  optionD?: string
  answer?: string
  explanation?: string
}

function parseCSV(text: string): MCQ[] {
  const rows: string[][] = []
  let cur = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"'
        i++
      } else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(cur)
      cur = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      row.push(cur)
      cur = ''
      rows.push(row)
      row = []
      if (ch === '\r' && text[i + 1] === '\n') i++
    } else cur += ch
  }
  if (cur !== '' || row.length) {
    row.push(cur)
    rows.push(row)
  }

  if (!rows.length) return []
  const header = rows[0].map((h) => h.trim())
  const items: MCQ[] = []
  for (let r = 1; r < rows.length; r++) {
    const rr = rows[r]
    if (rr.every((c) => c.trim() === '')) continue
    const obj: any = {}
    for (let c = 0; c < header.length; c++)
      obj[header[c] ?? `col${c}`] = (rr[c] ?? '').trim()
    items.push({
      id: obj.id ?? `${r}`,
      subject: obj.subject ?? '',
      chapter: obj.chapter ?? '',
      topic: obj.topic ?? '',
      question: obj.question ?? obj.q ?? '',
      optionA: obj.optionA ?? obj.optiona ?? '',
      optionB: obj.optionB ?? obj.optionb ?? '',
      optionC: obj.optionC ?? obj.optionc ?? '',
      optionD: obj.optionD ?? obj.optiond ?? '',
      answer: (obj.answer ?? '').replace(/\s+/g, ''),
      explanation: obj.explanation ?? '',
    })
  }
  return items
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function CeePracticePage() {
  const [items, setItems] = useState<MCQ[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [countInput, setCountInput] = useState('20')
  const count = useMemo(
    () =>
      Math.max(
        1,
        Math.min(
          200,
          Number(isNaN(Number(countInput)) ? 20 : Number(countInput)),
        ),
      ),
    [countInput],
  )
  const [mode, setMode] = useState<'casual' | 'exam'>('casual')

  // session state
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<MCQ[]>([])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [examRunning, setExamRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  // AI feedback
  const [aiLoading, setAiLoading] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch('/data/topic-mapping.json')
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({})),
      fetch('/data/ceemcq.csv').then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      }),
    ])
      .then(([mapRaw, text]) => {
        if (cancelled) return
        const parsed = parseCSV(text)
        // apply mapping
        const map = (mapRaw || {}) as Record<string, string>
        const applied = parsed.map((it) => {
          const normTopic = (it.topic ?? '').toString().trim()
          const mapped = map[normTopic] ?? map[normTopic.trim()] ?? null
          return { ...it, topic: mapped || it.topic }
        })
        setItems(applied)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(String(e))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // timer for exam mode
  useEffect(() => {
    let iv: any = null
    if (examRunning && !finished) {
      iv = setInterval(
        () =>
          setSecondsLeft((s) => {
            if (s <= 1) {
              clearInterval(iv)
              setFinished(true)
              return 0
            }
            return s - 1
          }),
        1000,
      )
    }
    return () => {
      if (iv) clearInterval(iv)
    }
  }, [examRunning, finished])

  const subjects = useMemo(() => {
    if (!items) return []
    return Array.from(
      new Set(
        items.map((i) => (i.subject || 'Unspecified').trim()).filter(Boolean),
      ),
    ).sort()
  }, [items])

  const topics = useMemo(() => {
    if (!items) return []
    const filtered = items.filter(
      (i) => !subject || (i.subject || '') === subject,
    )
    return Array.from(
      new Set(filtered.map((i) => (i.topic || '').trim()).filter(Boolean)),
    ).sort()
  }, [items, subject])

  function start() {
    if (!items) return
    const pool = items.filter((i) => {
      if (subject && (i.subject || '') !== subject) return false
      if (topic && (i.topic || '') !== topic) return false
      return true
    })
    const chosen = shuffle(pool).slice(0, count)
    setQuestions(chosen)
    setAnswers({})
    setIndex(0)
    setSelected(null)
    setSelectedIndex(null)
    setRevealed(false)
    setFinished(false)
    setStarted(true)
    if (mode === 'exam') {
      setSecondsLeft(Math.max(60, Math.round(count * 72)))
      setExamRunning(true)
    }
  }

  function onSelect(opt: string, idx: number) {
    if (!started || finished) return
    if (mode === 'casual') {
      if (selected) return
      setSelected(opt)
      setSelectedIndex(idx)
      setRevealed(true)
      const q = questions[index]
      if (!q) return
      const correct = (q.answer || '' || '').toString().trim()
      const isIdx = Number.isInteger(Number(correct))
      const correctOpt = isIdx
        ? ['A', 'B', 'C', 'D'][Number(correct) - 1]
        : correct
      if (
        (isIdx && ['A', 'B', 'C', 'D'][idx] === correctOpt) ||
        (!isIdx && opt === correctOpt)
      ) {
        setAnswers((a) => ({ ...a, [q.id]: ['A', 'B', 'C', 'D'][idx] }))
      } else {
        setAnswers((a) => ({ ...a, [q.id]: ['A', 'B', 'C', 'D'][idx] }))
      }
    } else {
      const q = questions[index]
      if (!q) return
      setAnswers((a) => ({ ...a, [q.id]: ['A', 'B', 'C', 'D'][idx] }))
      setSelected(opt)
      setSelectedIndex(idx)
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true)
      setExamRunning(false)
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setSelectedIndex(null)
    setRevealed(false)
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1))
    setSelected(null)
    setSelectedIndex(null)
    setRevealed(false)
  }

  function score() {
    let s = 0
    for (const q of questions) {
      const sel = answers[q.id]
      if (!sel) continue
      const correct = (q.answer || '').toString().trim()
      if (!correct) continue
      const isIdx = Number.isInteger(Number(correct))
      const correctOpt = isIdx
        ? ['A', 'B', 'C', 'D'][Number(correct) - 1]
        : correct
      if (sel === correctOpt) s += 1
    }
    return s
  }

  function perSubjectResults() {
    const res: Record<
      string,
      { correct: number; wrong: number; total: number }
    > = {}
    for (const q of questions) {
      const s = q.subject || 'Unspecified'
      if (!res[s]) res[s] = { correct: 0, wrong: 0, total: 0 }
      res[s].total++
      const sel = answers[q.id]
      if (!sel) continue
      const correct = (q.answer || '').toString().trim()
      const isIdx = Number.isInteger(Number(correct))
      const correctOpt = isIdx
        ? ['A', 'B', 'C', 'D'][Number(correct) - 1]
        : correct
      if (sel === correctOpt) res[s].correct++
      else res[s].wrong++
    }
    return res
  }

  async function requestAiFeedback() {
    setAiLoading(true)
    setAiFeedback(null)
    try {
      const payload = {
        questions: questions.map((q) => ({
          id: q.id,
          subject: q.subject,
          topic: q.topic,
          question: q.question,
          answer: q.answer,
          explanation: q.explanation,
        })),
        answers,
        summary: {
          total: questions.length,
          score: score(),
          bySubject: perSubjectResults(),
        },
      }
      const res = await fetch('/api/cee-feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text()
        setAiFeedback(`Error: ${res.status} ${txt}`)
      } else {
        const data = await res.json()
        setAiFeedback(data.feedback || 'No feedback returned.')
      }
    } catch (e: any) {
      setAiFeedback(String(e))
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading CEE questions…</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>
  if (!items) return <div className="p-4">No questions available.</div>

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {!started && (
          <div className="rounded-2xl border p-4">
            <h2 className="mb-2 text-lg font-semibold">CEE Practice</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Choose subject, topic and number of questions to practice. Casual
              mode gives immediate feedback; Exam mode is timed.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col text-sm">
                Subject
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value)
                    setTopic('')
                  }}
                  className="mt-1 rounded-md border px-3 py-2"
                >
                  <option value="">Any subject</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Topic
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 rounded-md border px-3 py-2"
                  disabled={!topics.length}
                >
                  <option value="">Any topic</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                Number of questions
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={String(countInput)}
                  onChange={(e) => setCountInput(e.target.value)}
                  className="mt-1 rounded-md border px-3 py-2"
                />
              </label>
              <label className="flex flex-col text-sm">
                Mode
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="mt-1 rounded-md border px-3 py-2"
                >
                  <option value="casual">Casual (immediate)</option>
                  <option value="exam">Exam (timed)</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={start}>Start practice</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSubject('')
                  setTopic('')
                  setCountInput('20')
                  setMode('casual')
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {started && !finished && questions.length > 0 && (
          <div className="mt-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm">
                Question {index + 1} / {questions.length}
              </div>
              <div className="flex items-center gap-3">
                {mode === 'exam' && (
                  <div className="rounded-full border px-3 py-1">
                    Time:{' '}
                    <Timer
                      durationMs={secondsLeft * 1000}
                      running={examRunning && !finished}
                      onExpire={() => {
                        setFinished(true)
                        setExamRunning(false)
                      }}
                    />
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {subject || 'Any subject'}
                  {topic ? ` • ${topic}` : ''} • {questions.length} q
                </div>
              </div>
            </div>

            <>
              <QuestionCard
                q={questions[index]?.question || ''}
                options={[
                  questions[index]?.optionA || '',
                  questions[index]?.optionB || '',
                  questions[index]?.optionC || '',
                  questions[index]?.optionD || '',
                ].filter(Boolean)}
                answerInfo={((): any => {
                  const a = (questions[index]?.answer || '').toString().trim()
                  // Numeric (1-based index)
                  const n = Number(a)
                  if (Number.isInteger(n) && !Number.isNaN(n))
                    return { type: 'index', index: Math.max(0, n - 1) }
                  // Letter answers like A/B/C/D -> map to index
                  const m = a.match(/^[A-D]$/i)
                  if (m)
                    return {
                      type: 'index',
                      index: m[0].toUpperCase().charCodeAt(0) - 65,
                    }
                  return { type: 'text', text: a }
                })()}
                subject={questions[index]?.subject}
                topic={questions[index]?.topic}
                year={undefined}
                selected={selected}
                selectedIndex={selectedIndex}
                onSelect={onSelect}
              />

              {mode === 'casual' && revealed && (
                <ExplanationPanel
                  text={questions[index]?.explanation ?? null}
                />
              )}
            </>

            <div className="mt-4 flex gap-2">
              <Button onClick={prev} disabled={index === 0}>
                Previous
              </Button>
              <Button onClick={next} className="ml-auto">
                {index + 1 >= questions.length ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        )}

        {finished && (
          <div className="mt-4 rounded-2xl border p-4">
            <h3 className="text-lg font-semibold">Results</h3>
            <div className="mt-2">
              Score: <strong>{score()}</strong> / {questions.length}
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <h4 className="font-medium">Per subject</h4>
                {Object.entries(perSubjectResults()).map(([s, v]) => (
                  <div key={s} className="mt-2 rounded border p-2">
                    <div className="font-semibold">{s}</div>
                    <div className="text-sm">
                      Correct: {v.correct} | Wrong: {v.wrong} | Total: {v.total}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-medium">Review</h4>
                <div className="mt-2 max-h-72 overflow-auto">
                  {questions.map((q, i) => {
                    const opts = [
                      q.optionA,
                      q.optionB,
                      q.optionC,
                      q.optionD,
                    ].filter(Boolean)
                    const sel = answers[q.id]
                    const ans = (q.answer || '').toString().trim()
                    const isIdx = Number.isInteger(Number(ans))
                    const correctOpt = isIdx
                      ? ['A', 'B', 'C', 'D'][Number(ans) - 1]
                      : ans
                    return (
                      <div key={q.id} className="mb-3 border-b pb-2">
                        <div className="text-sm font-medium">
                          {i + 1}. {q.question}
                        </div>
                        <div className="text-xs">
                          Your answer: {sel ?? '—'} | Correct: {correctOpt}
                        </div>
                        {q.explanation && (
                          <div className="mt-1 text-xs">
                            Explanation: {q.explanation}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => {
                  setStarted(false)
                  setFinished(false)
                  setAiFeedback(null)
                }}
              >
                Back to setup
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setStarted(true)
                  setFinished(false)
                  setIndex(0)
                  setAnswers({})
                  setSelected(null)
                  setRevealed(false)
                }}
              >
                Retry
              </Button>
              <div className="ml-auto">
                <Button onClick={requestAiFeedback} disabled={aiLoading}>
                  {aiLoading ? 'Thinking…' : 'Get AI feedback'}
                </Button>
              </div>
            </div>

            {aiFeedback && (
              <div className="mt-4 rounded border bg-slate-50 p-3">
                <h4 className="font-medium">AI feedback</h4>
                <div className="mt-2 whitespace-pre-wrap text-sm">
                  {aiFeedback}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
