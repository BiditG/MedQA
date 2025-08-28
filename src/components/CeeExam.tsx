'use client'
import React, { useEffect, useMemo, useState } from 'react'

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
      question: obj.question ?? '',
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

export default function CeeExam() {
  const [items, setItems] = useState<MCQ[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topicMap, setTopicMap] = useState<Record<string, string> | null>(null)
  const [syllabus, setSyllabus] = useState<Record<string, any> | null>(null)

  // exam settings
  // Official CEE (MECEE-BL) defaults
  const [durationMin, setDurationMin] = useState<number>(180) // fixed: 180 minutes
  const [marksPerCorrect, setMarksPerCorrect] = useState<number>(1) // +1 per correct
  const [negativePerWrong, setNegativePerWrong] = useState<number>(0.25) // -0.25 per wrong
  const [totalQuestions, setTotalQuestions] = useState<number>(200) // 200 questions
  const lockMode: 'lockAfterAnswer' = 'lockAfterAnswer'

  // exam state
  const [examQuestions, setExamQuestions] = useState<MCQ[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [lockedQuestions, setLockedQuestions] = useState<Set<string>>(new Set())
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState<number>(0)

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
      fetch('/data/cee-syllabus.json')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
      .then(([mapRaw, text, syllabusRaw]) => {
        if (cancelled) return
        const map = (mapRaw || {}) as Record<string, string>
        setTopicMap(map)
        const parsed = parseCSV(text)
        const applied = parsed.map((it) => {
          const normTopic = (it.topic ?? '').toString().trim()
          const mapped = map[normTopic] ?? map[normTopic.trim()] ?? null
          return { ...it, topic: mapped || it.topic }
        })
        setItems(applied)
        setSyllabus(syllabusRaw || null)
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

  useEffect(() => {
    let iv: any = null
    if (started && !finished) {
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
  }, [started, finished])

  // keyboard shortcuts for exam: A/B/C/D and navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!started || finished) return
      const k = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(k)) {
        selectOptionForCurrent(k)
      } else if (k === 'ARROWLEFT') goPrev()
      else if (k === 'ARROWRIGHT') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, finished, examQuestions, index, answers])

  const progress = useMemo(() => {
    if (!examQuestions.length) return 0
    const answered = Object.keys(answers).length
    return Math.round((answered / examQuestions.length) * 100)
  }, [answers, examQuestions])

  function startExam() {
    if (!items) return
    // filter out auto-generated placeholder questions (ids prefixed with gen_, or chapter/topic marked Generated)
    const real = items.filter((i) => {
      const id = (i.id || '').toString()
      const chapter = (i.chapter || '').toString().toLowerCase()
      const topic = (i.topic || '').toString().toLowerCase()
      const question = (i.question || '').toString().toLowerCase()
      if (id.startsWith('gen_')) return false
      if (chapter === 'generated' || topic === 'generated') return false
      if (question.includes('auto-generated placeholder')) return false
      return true
    })
    if (real.length < totalQuestions) {
      // if not enough real questions, warn and fall back to all items
      console.warn(
        `Only ${real.length} real questions available; filling remaining with available items.`,
      )
    }
    const poolSource = real.length >= totalQuestions ? real : items
    const pool = shuffle(poolSource).slice(
      0,
      Math.min(totalQuestions, poolSource.length),
    )
    setExamQuestions(pool)
    setAnswers({})
    setLockedQuestions(new Set())
    setIndex(0)
    setStarted(true)
    setFinished(false)
    setSecondsLeft(durationMin * 60)
  }
  function selectOptionForCurrent(opt: string) {
    if (!started || finished) return
    const q = examQuestions[index]
    if (!q) return
    const qid = q.id
    // enforce lock rules: once answered it's locked (lockAfterAnswer behavior)
    if (answers[qid]) return
    setAnswers((a) => ({ ...a, [qid]: opt }))
    // If lock-after-answer mode, lock this question and auto-advance
    if (lockMode === 'lockAfterAnswer') {
      setLockedQuestions((s) => {
        const n = new Set(s)
        n.add(qid)
        return n
      })
      // auto-advance if not last
      if (index < examQuestions.length - 1) {
        setIndex((i) => Math.min(examQuestions.length - 1, i + 1))
      }
    }
  }

  function submitExam() {
    setFinished(true)
    setStarted(false)
  }

  function goNext() {
    const cur = examQuestions[index]
    // no-op: lockAfterLeave mode removed; lockedQuestions still used to track locked state
    setIndex((i) => Math.min(examQuestions.length - 1, i + 1))
  }

  function goPrev() {
    // If lock-after-answer is active, don't allow going back once answered/locked
    if (lockMode === 'lockAfterAnswer') return
    const cur = examQuestions[index]
    if (lockMode === 'lockAfterLeave' && cur) {
      setLockedQuestions((s) => {
        const n = new Set(s)
        n.add(cur.id)
        return n
      })
    }
    setIndex((i) => Math.max(0, i - 1))
  }

  function calculateScore() {
    let score = 0
    for (const q of examQuestions) {
      const sel = answers[q.id]
      if (!sel) continue
      if ((q.answer ?? '').toUpperCase() === sel.toUpperCase())
        score += marksPerCorrect
      else score -= negativePerWrong
    }
    return score
  }

  function perSubjectResults() {
    const res: Record<
      string,
      { correct: number; wrong: number; total: number; marks: number }
    > = {}
    for (const q of examQuestions) {
      const subj = q.subject || 'Unspecified'
      if (!res[subj]) res[subj] = { correct: 0, wrong: 0, total: 0, marks: 0 }
      res[subj].total++
      const sel = answers[q.id]
      if (!sel) continue
      if ((q.answer ?? '').toUpperCase() === sel.toUpperCase()) {
        res[subj].correct++
        res[subj].marks += marksPerCorrect
      } else {
        res[subj].wrong++
        res[subj].marks -= negativePerWrong
      }
    }
    return res
  }

  if (loading) return <div className="p-4">Loading exam...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>
  if (!items) return <div className="p-4">No questions available.</div>

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h2 className="mb-4 text-2xl font-semibold">
        CEE Full Exam — 200 Questions
      </h2>

      {!started && !finished && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border bg-white p-4 md:col-span-2">
            <p className="mb-4">
              This exam uses the official CEE (MECEE-BL) format:
            </p>
            <ul className="mb-3 list-inside list-disc text-sm">
              <li>
                Total questions: <strong>{totalQuestions}</strong> (1 mark each)
              </li>
              <li>
                Duration: <strong>{durationMin} minutes</strong>
              </li>
              <li>
                Marking: <strong>+{marksPerCorrect} for correct</strong>,{' '}
                <strong>-{negativePerWrong} for incorrect</strong>
              </li>
              <li>
                Passing criteria: <strong>50% overall</strong> — typically
                100/200
              </li>
            </ul>
            <div className="mb-2 text-sm font-medium">
              Difficulty distribution
            </div>
            <div className="text-sm">
              <div>Recall: 30%</div>
              <div>Understanding: 50%</div>
              <div>Application: 20%</div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              The official scheme is applied by default and fields are fixed to
              match the CEE format. Answers are locked after selection and you
              cannot go back.
            </div>
          </div>

          <div className="rounded border bg-white p-4">
            <div className="mb-2 text-sm">Syllabus summary</div>
            {syllabus ? (
              <div className="text-sm">
                {Object.entries(syllabus).map(([s, v]) => (
                  <div key={s} className="mb-2">
                    <div className="font-medium">{s}</div>
                    <div className="text-xs">
                      Total marks: {(v as any).totalMarks}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No syllabus file found.
              </div>
            )}
            <div className="mt-4">
              <button
                onClick={startExam}
                className="w-full rounded bg-red-600 px-3 py-2 text-white"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {started && !finished && (
        <div className="rounded border bg-white p-4">
          <div className="mb-3 flex flex-col justify-between sm:flex-row sm:items-center">
            <div className="text-sm">
              Question {index + 1} / {examQuestions.length}
            </div>
            <div className="mt-2 font-mono sm:mt-0">
              {Math.floor(secondsLeft / 60)
                .toString()
                .padStart(2, '0')}
              :{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="mb-3 text-sm text-gray-600">
            {examQuestions[index]?.subject} — {examQuestions[index]?.topic}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="break-words text-lg font-medium">
              {examQuestions[index]?.question}
            </div>
            {answers[examQuestions[index]?.id || ''] && (
              <div className="rounded border bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                Locked
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {['A', 'B', 'C', 'D'].map((k) => {
              const txt =
                (examQuestions[index]
                  ? (examQuestions[index] as any)[`option${k}`]
                  : '') || ''
              if (!txt) return null
              const selected = answers[examQuestions[index].id] === k
              const base =
                'text-left p-4 rounded border transition-colors duration-150 ease-in-out w-full text-sm sm:text-base'
              const cls = selected
                ? 'bg-blue-50 border-blue-300'
                : 'bg-white hover:bg-slate-50'
              return (
                <button
                  key={k}
                  className={`${base} ${cls}`}
                  onClick={() => selectOptionForCurrent(k)}
                >
                  <div className="mr-2 inline-block font-semibold">{k}</div>
                  <span className="text-sm">{txt}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={goPrev}
              disabled={lockMode === 'lockAfterAnswer' || index === 0}
              className="w-full rounded border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Previous
            </button>
            <button
              onClick={goNext}
              className="w-full rounded border px-3 py-2 sm:w-auto"
            >
              Next
            </button>
            <div className="ml-0 flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
              <div className="text-sm">Progress: {progress}%</div>
              <button
                onClick={submitExam}
                className="w-full rounded bg-green-600 px-3 py-2 text-white sm:w-auto"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="rounded border bg-white p-4">
          <h3 className="mb-2 text-xl font-semibold">Results</h3>
          <div className="mb-2">
            Score: <strong>{calculateScore().toFixed(2)}</strong>
          </div>
          <div className="mb-4">
            Answered: {Object.keys(answers).length} / {examQuestions.length}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Per Subject</h4>
              {Object.entries(perSubjectResults()).map(([s, v]) => (
                <div key={s} className="mb-2 rounded border p-2">
                  <div className="font-semibold">{s}</div>
                  <div className="text-sm">
                    Correct: {v.correct} | Wrong: {v.wrong} | Total: {v.total}
                  </div>
                  <div className="text-sm">Marks: {v.marks.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div>
              <h4 className="mb-2 font-medium">Review</h4>
              <div className="max-h-80 overflow-auto text-sm">
                {examQuestions.map((q, i) => {
                  const sel = answers[q.id]
                  const correct = (q.answer ?? '').toUpperCase()
                  return (
                    <div key={q.id} className="mb-2 border-b pb-2">
                      <div className="text-sm font-medium">
                        {i + 1}. {q.question}
                      </div>
                      <div className="text-xs">
                        Your answer: {sel ?? '—'} | Correct: {correct}
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
        </div>
      )}
    </div>
  )
}
