'use client'
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { endExamSession } from '@/lib/examClient'

// Minimal duplication of CeeExam with title tweaks for Mock Exam
// Uses same CSV (public/data/ceemcq.csv) and syllabus file.

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

export default function WeeklyExam() {
  const router = useRouter()
  const [items, setItems] = useState<MCQ[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topicMap, setTopicMap] = useState<Record<string, string> | null>(null)
  const [syllabus, setSyllabus] = useState<Record<string, any> | null>(null)

  // Mock exam settings: 200 Qs, 3 hours, +1 / -0.25, no backtracking after answer
  const [durationMin] = useState<number>(180)
  const [marksPerCorrect] = useState<number>(1)
  const [negativePerWrong] = useState<number>(0.25)
  const [totalQuestions] = useState<number>(200)
  const lockMode: 'lockAfterAnswer' = 'lockAfterAnswer'

  // exam state
  const [examQuestions, setExamQuestions] = useState<MCQ[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  // Timer + flow state
  const [secondsLeft, setSecondsLeft] = useState<number>(durationMin * 60)
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [resultSubmitted, setResultSubmitted] = useState(false)
  const [resultSubmitting, setResultSubmitting] = useState(false)
  const [resultError, setResultError] = useState<string | null>(null)
  // Per-question choice
  const [choice, setChoice] = useState<string | null>(null)

  // Optional helper to format time (mm:ss)
  function formatTime(total: number) {
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Reset selection when moving to a new question
  useEffect(() => {
    setChoice(null)
  }, [index])

  // Start/restart timer when exam starts
  useEffect(() => {
    if (started) setSecondsLeft(durationMin * 60)
  }, [started, durationMin])

  // Ticking timer
  useEffect(() => {
    if (!started || finished) return
    const id = setInterval(() => {
      setSecondsLeft((s: number) => {
        const next = s - 1
        if (next <= 0) {
          clearInterval(id)
          return 0
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [started, finished])

  useEffect(() => {
    if (!started || finished || secondsLeft !== 0) return
    finishExam(answers)
  }, [secondsLeft, started, finished, answers])

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
    function onKey(e: KeyboardEvent) {
      if (!started || finished) return
      const tgt = e.target as HTMLElement | null
      const tag = tgt?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tgt?.isContentEditable)
        return

      const k = e.key.toUpperCase()
      if (['A', 'B', 'C', 'D'].includes(k)) {
        selectOptionForCurrent(k) // select only; no submit on keys
      }
      // Removed Enter/ArrowRight submission
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [started, finished, examQuestions, index, answers, choice])

  const progress = useMemo(() => {
    if (!examQuestions.length) return 0
    const answered = Object.keys(answers).length
    return Math.round((answered / examQuestions.length) * 100)
  }, [answers, examQuestions])

  function startExam() {
    if (!items) return
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

    // Syllabus-driven default distribution. These are relative weights and
    // will be normalized to allocate slots from totalQuestions.
    const weights: Record<string, number> = {
      life: 0.8, // biology + botany + zoology combined
      physics: 0.5,
      chemistry: 0.5,
      mat: 0.2,
    }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

    // Build subject -> items map (lowercased keys)
    const pools: Record<string, MCQ[]> = {}
    for (const it of real) {
      const s =
        ((it.subject || '') as string).toString().trim().toLowerCase() ||
        'unspecified'
      if (!pools[s]) pools[s] = []
      pools[s].push(it)
    }

    const lifeSubjects = ['biology', 'botany', 'zoology']
    const matSubjects = ['mat', 'reasoning']

    function takeFromPool(arr: MCQ[], n: number, takenIds: Set<string>) {
      const a = shuffle(arr.slice()).filter((x) => !takenIds.has(x.id))
      const sel = a.slice(0, Math.max(0, n))
      for (const q of sel) takenIds.add(q.id)
      return sel
    }

    const targets: Record<string, number> = {}
    for (const k of Object.keys(weights)) {
      targets[k] = Math.round((weights[k] / totalWeight) * totalQuestions)
    }

    const taken = new Set<string>()
    const selected: MCQ[] = []

    // LIFE group (biology/botany/zoology)
    const lifePool: MCQ[] = []
    for (const ls of lifeSubjects) if (pools[ls]) lifePool.push(...pools[ls])
    if (lifePool.length > 0)
      selected.push(...takeFromPool(lifePool, targets.life, taken))

    // Physics
    if (pools['physics'])
      selected.push(...takeFromPool(pools['physics'], targets.physics, taken))

    // Chemistry
    if (pools['chemistry'])
      selected.push(
        ...takeFromPool(pools['chemistry'], targets.chemistry, taken),
      )

    // MAT / reasoning
    const matPool: MCQ[] = []
    for (const m of matSubjects) if (pools[m]) matPool.push(...pools[m])
    if (matPool.length > 0)
      selected.push(...takeFromPool(matPool, targets.mat, taken))

    // Fill remaining slots from remaining real items
    const remainingNeeded = Math.max(0, totalQuestions - selected.length)
    if (remainingNeeded > 0) {
      const remainingPool = shuffle(real.filter((q) => !taken.has(q.id)))
      const extra = remainingPool.slice(0, remainingNeeded)
      for (const q of extra) taken.add(q.id)
      selected.push(...extra)
    }

    // Trim if overfull due to rounding
    let finalPool = selected
    if (finalPool.length > totalQuestions)
      finalPool = shuffle(finalPool).slice(0, totalQuestions)

    // Fallback: if still short (very small dataset), fall back to shuffled real/items
    if (finalPool.length < totalQuestions) {
      const fallback = shuffle(
        real.length >= totalQuestions ? real : items,
      ).slice(0, Math.min(totalQuestions, real.length || items.length))
      finalPool = fallback
    }

    setExamQuestions(finalPool)
    setAnswers({})
    setIndex(0)
    setStarted(true)
    setFinished(false)
    setSecondsLeft(durationMin * 60)
  }

  // Provide this for any existing callers in your JSX
  function selectOptionForCurrent(s: string) {
    setChoice(s)
  }

  async function submitCurrent() {
    const q = examQuestions[index]
    if (!q || !choice) return
    const nextAnswers = { ...answers, [q.id]: choice }
    setAnswers(nextAnswers)
    const next = index + 1
    if (next < examQuestions.length) {
      setIndex(next)
    } else {
      await finishExam(nextAnswers)
    }
  }

  // NEW: skip without answering
  async function skipCurrent() {
    const next = index + 1
    if (next < examQuestions.length) {
      setIndex(next)
    } else {
      await finishExam(answers)
    }
  }

  function submitExam() {
    finishExam(answers)
  }

  function goNext() {
    setIndex((i) => Math.min(examQuestions.length - 1, i + 1))
  }
  function goPrev() {
    // no backtracking after answer
  }

  function calculateScore() {
    return calculateScoreFromAnswers(answers)
  }

  function calculateScoreFromAnswers(answerSet: Record<string, string>) {
    let score = 0
    for (const q of examQuestions) {
      const sel = answerSet[q.id]
      if (!sel) continue
      if ((q.answer ?? '').toUpperCase() === sel.toUpperCase())
        score += marksPerCorrect
      else score -= negativePerWrong
    }
    return score
  }

  function perSubjectResults() {
    return perSubjectResultsFromAnswers(answers)
  }

  function perSubjectResultsFromAnswers(answerSet: Record<string, string>) {
    const res: Record<
      string,
      { correct: number; wrong: number; total: number; marks: number }
    > = {}
    for (const q of examQuestions) {
      const subj = q.subject || 'Unspecified'
      if (!res[subj]) res[subj] = { correct: 0, wrong: 0, total: 0, marks: 0 }
      res[subj].total++
      const sel = answerSet[q.id]
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

  function buildLeaderboardPayload(answerSet: Record<string, string>) {
    const subjectScores = perSubjectResultsFromAnswers(answerSet)
    const biologyScore = Object.entries(subjectScores).reduce(
      (sum, [subject, value]) => {
        const key = subject.toLowerCase()
        if (
          key.includes('biology') ||
          key.includes('botany') ||
          key.includes('zoology')
        ) {
          return sum + value.marks
        }
        return sum
      },
      0,
    )
    const answeredCount = Object.keys(answerSet).length
    const correctCount = examQuestions.reduce((sum, q) => {
      const selected = answerSet[q.id]
      return selected &&
        (q.answer ?? '').toUpperCase() === selected.toUpperCase()
        ? sum + 1
        : sum
    }, 0)
    const wrongCount = Math.max(0, answeredCount - correctCount)

    return {
      totalScore: calculateScoreFromAnswers(answerSet),
      biologyScore,
      answeredCount,
      correctCount,
      wrongCount,
      unansweredCount: Math.max(0, examQuestions.length - answeredCount),
      totalQuestions: examQuestions.length,
      subjectScores,
    }
  }

  async function finishExam(answerSet: Record<string, string>) {
    if (finished || resultSubmitting) return
    setResultSubmitting(true)
    setResultError(null)
    setFinished(true)
    setStarted(false)

    try {
      const resp = await fetch('/api/weekly-exam/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildLeaderboardPayload(answerSet)),
      })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok) throw new Error(data?.error || 'Could not submit ranking')
      setResultSubmitted(true)
    } catch (e: any) {
      setResultError(e?.message || 'Could not submit ranking')
    } finally {
      setResultSubmitting(false)
      try {
        await endExamSession()
      } catch {}
    }
  }

  async function onExitEarly() {
    // Just navigate home after exam completion
    router.replace('/')
  }

  if (loading) return <div className="p-4">Loading exam...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>
  if (!items) return <div className="p-4">No questions available.</div>

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h2 className="mb-4 text-2xl font-semibold">Mock Exam - 200 Questions</h2>

      {!started && !finished && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border bg-white p-4 md:col-span-2">
            <p className="mb-4">Exam rules:</p>
            <ul className="mb-3 list-inside list-disc text-sm">
              <li>
                Total questions: <strong>{totalQuestions}</strong> (1 mark each)
              </li>
              <li>
                Time: <strong>{durationMin} minutes</strong> (3 hours)
              </li>
              <li>
                Marking: <strong>+{marksPerCorrect} for correct</strong>,{' '}
                <strong>-{negativePerWrong} for incorrect</strong>
              </li>
              <li>
                No backtracking: once an option is selected, it is locked.
              </li>
            </ul>
            <div className="mb-2 text-sm font-medium">Syllabus coverage</div>
            <div className="text-xs text-muted-foreground">
              Physics, Chemistry, Botany, Zoology, MAT
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Answers are locked after selection and you cannot go back.
            </div>
          </div>

          <div className="rounded border bg-white p-4">
            <div className="mb-2 text-sm">Quick summary</div>
            <div className="text-sm">
              3 hours • 200 Questions • Negative marking
            </div>
            <div className="mt-4">
              <button
                onClick={startExam}
                className="w-full rounded bg-primary px-3 py-2 text-white"
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
              const q = examQuestions[index]
              if (!q) return null
              const txt = (q as any)[`option${k}`] || ''
              if (!txt) return null
              const currentId = q.id
              // Use in-progress selection if present, else locked answer
              const isSelected = (choice ?? answers[currentId]) === k
              const isLocked = !!answers[currentId]
              const base =
                'text-left p-4 rounded border transition-colors duration-150 ease-in-out w-full text-sm sm:text-base'
              const cls = isSelected
                ? 'border-2 border-blue-500 bg-blue-50'
                : 'bg-white hover:border-gray-300'
              return (
                <button
                  key={k}
                  className={`${base} ${cls}`}
                  onClick={() => selectOptionForCurrent(k)}
                  disabled={isLocked} // prevent changing after locked
                >
                  <div className="mr-2 inline-block font-semibold">{k}</div>
                  <span className="text-sm">{txt}</span>
                </button>
              )
            })}
          </div>

          {/* Actions row: Progress + Skip + Submit (Submit on the far right) */}
          <div className="mt-4 flex items-center">
            <div className="ml-auto flex items-center gap-3">
              <div className="text-sm">Progress: {progress}%</div>
              <button
                type="button"
                onClick={skipCurrent}
                className="rounded border px-4 py-2 hover:bg-muted"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={submitCurrent}
                disabled={!choice}
                className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50"
              >
                Submit answer
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
          <div className="mb-4 rounded-md border bg-muted/30 p-3 text-sm">
            {resultSubmitting
              ? 'Submitting your score to rankings...'
              : resultSubmitted
                ? 'Your score has been added to rankings.'
                : resultError
                  ? `Leaderboard submission failed: ${resultError}`
                  : 'Leaderboard submission pending.'}
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
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/mock-exam/rankings"
              className="inline-flex items-center justify-center rounded bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90"
            >
              View Rankings
            </Link>
            <button
              className="rounded bg-primary px-3 py-2 text-white"
              onClick={onExitEarly}
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
