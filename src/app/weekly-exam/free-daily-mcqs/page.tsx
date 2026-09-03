'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw } from 'lucide-react'

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

const sources = [
  '/data/ceemcqtopicwise.csv',
  '/data/ceemcq.csv',
  '/data/pastquestions.csv',
]

export default function FreeDailyMcqsPage() {
  const [questions, setQuestions] = useState<MCQ[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all(
      sources.map((source) =>
        fetch(source)
          .then((response) => (response.ok ? response.text() : ''))
          .catch(() => ''),
      ),
    )
      .then((texts) => {
        if (cancelled) return
        const pool = texts
          .flatMap(parseCSV)
          .filter(
            (item) =>
              item.question &&
              item.optionA &&
              item.optionB &&
              item.optionC &&
              item.optionD &&
              item.answer,
          )
        setQuestions(selectDailyQuestions(pool, 20))
        setLoading(false)
      })
      .catch((e: any) => {
        if (cancelled) return
        setError(e?.message || 'Could not load daily MCQs')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const answeredCount = Object.keys(answers).length
  const score = useMemo(
    () =>
      questions.reduce((sum, question) => {
        const selected = answers[question.id]
        if (!selected) return sum
        return selected.toUpperCase() === question.answer?.toUpperCase()
          ? sum + 1
          : sum
      }, 0),
    [answers, questions],
  )

  function choose(questionId: string, option: string) {
    if (finished) return
    setAnswers((value) => ({ ...value, [questionId]: option }))
  }

  function reset() {
    setAnswers({})
    setFinished(false)
  }

  if (loading) return <div className="p-6">Loading daily MCQs...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 border-b pb-5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
          Free Daily MCQs
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Free Daily MCQs
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          20 fresh CEE-style MCQs are selected automatically every day.
        </p>
      </header>

      <section className="mb-5 rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            Answered {answeredCount} / {questions.length}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFinished(true)}
              disabled={answeredCount < questions.length}
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Finish
            </button>
          </div>
        </div>
      </section>

      {finished ? (
        <section className="mb-6 rounded-lg border bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">
                Result: {score} / {questions.length}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Review the correct answers and explanations below.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        {questions.map((question, index) => (
          <article key={question.id} className="rounded-lg border bg-card p-4">
            <div className="mb-2 text-xs font-semibold text-muted-foreground">
              {index + 1}. {question.subject}
              {question.topic ? ` / ${question.topic}` : ''}
            </div>
            <h2 className="text-base font-semibold leading-6">
              {question.question}
            </h2>
            <div className="mt-4 grid gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((option) => {
                const value = question[`option${option}`]
                if (!value) return null
                const selected = answers[question.id] === option
                const correct =
                  finished && question.answer?.toUpperCase() === option
                const wrong = finished && selected && !correct
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(question.id, option)}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      correct
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-900'
                        : wrong
                          ? 'border-red-300 bg-red-50 text-red-800'
                          : selected
                            ? 'border-primary bg-primary/10'
                            : 'bg-background hover:border-primary/40'
                    }`}
                  >
                    <span className="mr-2 font-semibold">{option}.</span>
                    {value}
                  </button>
                )
              })}
            </div>
            {finished && question.explanation ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {question.explanation}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  )
}

function selectDailyQuestions(pool: MCQ[], count: number) {
  const today = new Date().toISOString().slice(0, 10)
  const shuffled = seededShuffle(pool, hashString(today))
  return shuffled.slice(0, count)
}

function seededShuffle<T>(items: T[], seed: number) {
  const next = items.slice()
  let state = seed || 1
  for (let index = next.length - 1; index > 0; index--) {
    state = (state * 1664525 + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

function hashString(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function parseCSV(text: string): MCQ[] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') index += 1
      row.push(current)
      current = ''
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
    } else {
      current += char
    }
  }

  if (current || row.length) {
    row.push(current)
    rows.push(row)
  }

  const [headerRow, ...dataRows] = rows
  if (!headerRow) return []
  const headers = headerRow.map((header) => header.trim().replace(/^"|"$/g, ''))

  return dataRows.map((cells, rowIndex) => {
    const obj = Object.fromEntries(
      headers.map((header, index) => [
        header,
        (cells[index] || '').trim().replace(/^"|"$/g, ''),
      ]),
    ) as Record<string, string>

    return {
      id: obj.id || `daily-${rowIndex}`,
      subject: obj.subject || 'CEE',
      chapter: obj.chapter || '',
      topic: obj.topic || '',
      question: obj.question || '',
      optionA: obj.optionA || '',
      optionB: obj.optionB || '',
      optionC: obj.optionC || '',
      optionD: obj.optionD || '',
      answer: (obj.answer || '').replace(/\s+/g, ''),
      explanation: obj.explanation || '',
    }
  })
}
