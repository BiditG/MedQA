'use client'

import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Atom,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  Clock3,
  Dna,
  FlaskConical,
  Leaf,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/utils/tailwind'
import { ceeMcqSyllabus } from '@/data/ceeMcqSyllabus'
import { CeeAiExplanationPanel } from './CeeAiExplanationPanel'

type Mode = 'casual' | 'timed' | 'negative'
type Screen = 'setup' | 'quiz' | 'results'

type CeeMcq = {
  id: string
  subject: string
  chapter: string
  topic: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  answer: string
  explanation: string
}

type SessionAnswer = {
  selected?: string
  correct: boolean
}

const subjectVisuals = {
  physics: {
    icon: Atom,
    accent: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  chemistry: {
    icon: FlaskConical,
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  zoology: {
    icon: Dna,
    accent: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  botany: {
    icon: Leaf,
    accent: 'border-lime-200 bg-lime-50 text-lime-700',
  },
  mat: {
    icon: Calculator,
    accent: 'border-amber-200 bg-amber-50 text-amber-700',
  },
}

const optionKeys = ['A', 'B', 'C', 'D'] as const

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function parseCSV(text: string): CeeMcq[] {
  const rows: string[][] = []
  let current = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      row.push(current)
      current = ''
      rows.push(row)
      row = []
      if (char === '\r' && text[i + 1] === '\n') i++
    } else {
      current += char
    }
  }

  if (current || row.length) {
    row.push(current)
    rows.push(row)
  }

  if (!rows.length) return []

  const header = rows[0].map((cell) => cell.trim())

  return rows
    .slice(1)
    .map((cells, index) => {
      const record: Record<string, string> = {}
      header.forEach((key, cellIndex) => {
        record[key] = (cells[cellIndex] ?? '').trim()
      })

      return {
        id: record.id || `cee-${index}`,
        subject: record.subject || '',
        chapter: record.chapter || '',
        topic: record.topic || '',
        question: record.question || '',
        optionA: record.optionA || '',
        optionB: record.optionB || '',
        optionC: record.optionC || '',
        optionD: record.optionD || '',
        answer: (record.answer || '').trim().toUpperCase(),
        explanation: record.explanation || '',
      }
    })
    .filter(
      (item) =>
        item.question &&
        item.subject &&
        normalize(item.subject) !== 'subject' &&
        optionKeys.includes(item.answer as (typeof optionKeys)[number]),
    )
}

function shuffle<T>(items: T[]) {
  const next = items.slice()
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  return `${minutes}:${String(remainder).padStart(2, '0')}`
}

export function CeeMcqSelector() {
  const [items, setItems] = useState<CeeMcq[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('setup')

  const [subjectSlug, setSubjectSlug] = useState('physics')
  const [topicTitle, setTopicTitle] = useState('all')
  const [subtopicTitle, setSubtopicTitle] = useState('all')
  const [mode, setMode] = useState<Mode>('casual')
  const [countInput, setCountInput] = useState('20')

  const [questions, setQuestions] = useState<CeeMcq[]>([])
  const [answers, setAnswers] = useState<Record<string, SessionAnswer>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetch('/data/ceemcqtopicwise.csv')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.text()
      })
      .then((text) => {
        if (cancelled) return
        setItems(parseCSV(text))
        setLoading(false)
      })
      .catch((caughtError) => {
        if (cancelled) return
        setError(String(caughtError))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (screen !== 'quiz') return
    if (mode === 'casual') return
    if (secondsLeft <= 0) {
      setScreen('results')
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => value - 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [mode, screen, secondsLeft])

  const selectedSubject =
    ceeMcqSyllabus.find((subject) => subject.slug === subjectSlug) ??
    ceeMcqSyllabus[0]

  const subjectCounts = useMemo(() => {
    return ceeMcqSyllabus.reduce<Record<string, number>>((counts, subject) => {
      counts[subject.slug] = items.filter(
        (item) => normalize(item.subject) === normalize(subject.name),
      ).length
      return counts
    }, {})
  }, [items])

  const subjectItems = useMemo(
    () =>
      items.filter(
        (item) => normalize(item.subject) === normalize(selectedSubject.name),
      ),
    [items, selectedSubject.name],
  )

  const csvTopics = useMemo(
    () =>
      Array.from(
        new Set(subjectItems.map((item) => item.chapter).filter(Boolean)),
      ).sort(),
    [subjectItems],
  )

  const topicOptions = csvTopics.length
    ? csvTopics
    : selectedSubject.topics.map((topic) => topic.title)

  const selectedTopic = topicTitle === 'all' ? null : topicTitle

  const subtopicOptions = useMemo(() => {
    if (!selectedTopic) return []

    const fromCsv = Array.from(
      new Set(
        subjectItems
          .filter(
            (item) => normalize(item.chapter) === normalize(selectedTopic),
          )
          .map((item) => item.topic)
          .filter(Boolean),
      ),
    ).sort()

    if (fromCsv.length) return fromCsv

    return (
      selectedSubject.topics.find(
        (topic) => normalize(topic.title) === normalize(selectedTopic),
      )?.subtopics ?? []
    )
  }, [selectedSubject.topics, selectedTopic, subjectItems])

  const filteredItems = useMemo(() => {
    return subjectItems.filter((item) => {
      if (
        selectedTopic &&
        normalize(item.chapter) !== normalize(selectedTopic)
      ) {
        return false
      }

      if (
        subtopicTitle !== 'all' &&
        normalize(item.topic) !== normalize(subtopicTitle)
      ) {
        return false
      }

      return true
    })
  }, [selectedTopic, subjectItems, subtopicTitle])

  const requestedCount = Math.max(
    1,
    Math.min(200, Number.isNaN(Number(countInput)) ? 20 : Number(countInput)),
  )
  const availableCount = filteredItems.length
  const actualCount = Math.min(requestedCount, availableCount)
  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null
  const visual =
    subjectVisuals[selectedSubject.slug as keyof typeof subjectVisuals]
  const SubjectIcon = visual.icon

  const scopeLabel =
    topicTitle === 'all'
      ? `All ${selectedSubject.name}`
      : subtopicTitle === 'all'
        ? topicTitle
        : subtopicTitle

  function chooseSubject(slug: string) {
    setSubjectSlug(slug)
    setTopicTitle('all')
    setSubtopicTitle('all')
  }

  function chooseTopic(value: string) {
    setTopicTitle(value)
    setSubtopicTitle('all')
  }

  function startPractice() {
    if (!actualCount) return

    const selectedQuestions = shuffle(filteredItems).slice(0, actualCount)
    setQuestions(selectedQuestions)
    setAnswers({})
    setCurrentIndex(0)
    setSecondsLeft(mode === 'casual' ? 0 : selectedQuestions.length * 120)
    setScreen('quiz')
  }

  function selectOption(option: string) {
    if (!currentQuestion || currentAnswer) return

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        selected: option,
        correct: currentQuestion.answer === option,
      },
    }))
  }

  function goNext() {
    if (currentIndex + 1 >= questions.length) {
      setScreen('results')
      return
    }

    setCurrentIndex((value) => value + 1)
  }

  function resetSetup() {
    setScreen('setup')
    setQuestions([])
    setAnswers({})
    setCurrentIndex(0)
    setSecondsLeft(0)
  }

  function getScore() {
    return questions.reduce((total, question) => {
      const answer = answers[question.id]
      if (!answer?.selected) return total
      if (answer.correct) return total + 1
      return mode === 'negative' ? total - 0.25 : total
    }, 0)
  }

  function getSubjectBreakdown() {
    const breakdown: Record<
      string,
      {
        correct: number
        wrong: number
        skipped: number
        total: number
        marks: number
      }
    > = {}

    questions.forEach((question) => {
      const subject = question.subject || 'Unspecified'
      if (!breakdown[subject]) {
        breakdown[subject] = {
          correct: 0,
          wrong: 0,
          skipped: 0,
          total: 0,
          marks: 0,
        }
      }

      breakdown[subject].total += 1
      const answer = answers[question.id]

      if (!answer?.selected) {
        breakdown[subject].skipped += 1
        return
      }

      if (answer.correct) {
        breakdown[subject].correct += 1
        breakdown[subject].marks += 1
      } else {
        breakdown[subject].wrong += 1
        if (mode === 'negative') breakdown[subject].marks -= 0.25
      }
    })

    return Object.entries(breakdown)
  }

  if (loading) {
    return <div className="p-6 text-sm">Loading CEE MCQs...</div>
  }

  if (error) {
    return <div className="p-6 text-sm text-red-600">Error: {error}</div>
  }

  if (screen === 'quiz' && currentQuestion) {
    const options = [
      { key: 'A', text: currentQuestion.optionA },
      { key: 'B', text: currentQuestion.optionB },
      { key: 'C', text: currentQuestion.optionC },
      { key: 'D', text: currentQuestion.optionD },
    ]

    return (
      <div className="w-full px-1 py-2 sm:px-4">
        <section className="mx-auto max-w-4xl">
          <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-background/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                {scopeLabel}
              </div>
              <div className="mt-1 font-semibold">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              {mode !== 'casual' ? (
                <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2">
                  <Clock3 className="h-4 w-4 text-primary" aria-hidden />
                  {formatTime(Math.max(0, secondsLeft))}
                </span>
              ) : null}
              <button
                type="button"
                onClick={resetSetup}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Setup
              </button>
            </div>
          </div>

          <div className="rounded-xl border bg-background/95 p-5 shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full bg-muted px-2.5 py-1">
                {currentQuestion.subject}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                {currentQuestion.chapter}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">
                {currentQuestion.topic}
              </span>
            </div>

            <h1 className="text-xl font-semibold leading-8">
              {currentQuestion.question}
            </h1>

            <div className="mt-5 grid gap-3">
              {options.map((option) => {
                const selected = currentAnswer?.selected === option.key
                const correct = currentQuestion.answer === option.key
                const answered = Boolean(currentAnswer)

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={answered}
                    onClick={() => selectOption(option.key)}
                    className={cn(
                      'min-h-12 flex items-center gap-3 rounded-lg border bg-background p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                      !answered && 'hover:border-primary/30 hover:bg-primary/5',
                      answered &&
                        correct &&
                        'border-emerald-300 bg-emerald-50 text-emerald-800',
                      answered &&
                        selected &&
                        !correct &&
                        'border-red-300 bg-red-50 text-red-800',
                    )}
                  >
                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-semibold">
                      {option.key}
                    </span>
                    <span className="text-sm font-medium">{option.text}</span>
                  </button>
                )
              })}
            </div>

            {currentAnswer ? (
              <div className="mt-5 rounded-lg border bg-muted/30 p-4">
                <div
                  className={cn(
                    'text-sm font-semibold',
                    currentAnswer.correct ? 'text-emerald-700' : 'text-red-700',
                  )}
                >
                  {currentAnswer.correct
                    ? 'Correct'
                    : `Wrong. Correct answer: ${currentQuestion.answer}`}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {currentQuestion.explanation || 'No explanation available.'}
                </p>
                <CeeAiExplanationPanel
                  questionId={currentQuestion.id}
                  subject={currentQuestion.subject}
                  chapter={currentQuestion.chapter}
                  topic={currentQuestion.topic}
                  question={currentQuestion.question}
                  options={options}
                  answer={currentQuestion.answer}
                  explanation={currentQuestion.explanation}
                  selectedOption={currentAnswer.selected}
                />
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                className={cn(
                  'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors',
                  currentAnswer
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border bg-background text-muted-foreground hover:text-foreground',
                )}
              >
                {currentIndex + 1 >= questions.length
                  ? 'Finish'
                  : currentAnswer
                    ? 'Next'
                    : 'Skip'}
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (screen === 'results') {
    const answered = Object.values(answers).filter((answer) => answer.selected)
    const correct = answered.filter((answer) => answer.correct).length
    const wrong = answered.length - correct
    const skipped = questions.length - answered.length
    const score = getScore()

    return (
      <div className="w-full px-1 py-2 sm:px-4">
        <section className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-background/95 p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Results
                </div>
                <h1 className="mt-1 text-3xl font-semibold">
                  {score.toFixed(2)} / {questions.length}
                </h1>
              </div>
              <button
                type="button"
                onClick={resetSetup}
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                New practice
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <ResultStat label="Correct" value={correct} tone="green" />
              <ResultStat label="Wrong" value={wrong} tone="red" />
              <ResultStat label="Skipped" value={skipped} tone="muted" />
              <ResultStat label="Mode" value={modeLabel(mode)} tone="blue" />
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold">Subject-wise breakdown</h2>
              <div className="mt-3 grid gap-3">
                {getSubjectBreakdown().map(([subject, value]) => (
                  <div
                    key={subject}
                    className="rounded-lg border bg-muted/20 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="font-semibold">{subject}</div>
                      <div className="text-sm font-semibold">
                        {value.marks.toFixed(2)} / {value.total}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Correct: {value.correct} | Wrong: {value.wrong} | Skipped:{' '}
                      {value.skipped}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="w-full px-1 py-2 sm:px-4">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6">
          <div className="border-primary/15 mb-3 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden />
            CEE MCQ Practice
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            CEE MCQs
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Select a subject, choose the topic depth, then pick your practice
            style.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {ceeMcqSyllabus.map((subject) => {
            const itemVisual =
              subjectVisuals[subject.slug as keyof typeof subjectVisuals]
            const Icon = itemVisual.icon
            const selected = selectedSubject.slug === subject.slug

            return (
              <button
                key={subject.slug}
                type="button"
                onClick={() => chooseSubject(subject.slug)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl border bg-background/90 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  selected && 'border-primary/35 bg-primary/5 shadow-md',
                )}
              >
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${itemVisual.accent}`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{subject.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {subjectCounts[subject.slug] ?? 0} MCQs
                  </span>
                </span>
                {selected ? (
                  <CheckCircle2
                    className="ml-auto h-4 w-4 text-primary"
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border bg-background/90 p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <span
                className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border ${visual.accent}`}
              >
                <SubjectIcon className="h-7 w-7" aria-hidden />
              </span>
              <div>
                <h2 className="text-2xl font-semibold">
                  {selectedSubject.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {selectedSubject.summary}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-lg border bg-muted/30 p-4">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                Current selection
              </div>
              <div className="mt-2 text-lg font-semibold">{scopeLabel}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {availableCount
                  ? `${actualCount} of ${availableCount} available MCQs`
                  : 'No MCQs found for this selection'}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-background/95 p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-lg font-semibold">Practice setup</h2>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Topic chooser
                <select
                  value={topicTitle}
                  onChange={(event) => chooseTopic(event.target.value)}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All {selectedSubject.name}</option>
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Subtopic chooser
                <select
                  value={subtopicTitle}
                  onChange={(event) => setSubtopicTitle(event.target.value)}
                  disabled={!selectedTopic}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted/50 disabled:text-muted-foreground"
                >
                  <option value="all">
                    {selectedTopic
                      ? `All ${selectedTopic}`
                      : 'Choose a topic first'}
                  </option>
                  {subtopicOptions.map((subtopic) => (
                    <option key={subtopic} value={subtopic}>
                      {subtopic}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Number of questions
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={countInput}
                  onChange={(event) => setCountInput(event.target.value)}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="grid gap-2">
                <div className="text-sm font-medium">Mode</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <ModeButton
                    active={mode === 'casual'}
                    icon={Sparkles}
                    label="Casual"
                    onClick={() => setMode('casual')}
                  />
                  <ModeButton
                    active={mode === 'timed'}
                    icon={Clock3}
                    label="Timed"
                    onClick={() => setMode('timed')}
                  />
                  <ModeButton
                    active={mode === 'negative'}
                    icon={ShieldCheck}
                    label="Negative"
                    onClick={() => setMode('negative')}
                  />
                </div>
                {mode === 'negative' ? (
                  <div className="text-xs text-muted-foreground">
                    Negative marking is timed at 2 minutes per question and
                    deducts 0.25 for each wrong answer.
                  </div>
                ) : mode === 'timed' ? (
                  <div className="text-xs text-muted-foreground">
                    Timed mode gives 2 minutes per question.
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={startPractice}
                disabled={!availableCount}
                className="mt-1 inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-50"
              >
                Start practice
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function modeLabel(mode: Mode) {
  if (mode === 'negative') return 'Negative'
  if (mode === 'timed') return 'Timed'
  return 'Casual'
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string
  value: number | string
  tone: 'green' | 'red' | 'blue' | 'muted'
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 text-xl font-semibold',
          tone === 'green' && 'text-emerald-700',
          tone === 'red' && 'text-red-700',
          tone === 'blue' && 'text-primary',
        )}
      >
        {value}
      </div>
    </div>
  )
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        active && 'border-primary/35 bg-primary/10 text-primary',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  )
}
