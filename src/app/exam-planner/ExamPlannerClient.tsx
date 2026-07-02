'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Atom,
  Calculator,
  CheckCircle2,
  Circle,
  ClipboardList,
  Dna,
  FlaskConical,
  Leaf,
  RotateCcw,
  TrendingUp,
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  ceeExamPlannerSubjects,
  ExamPlannerStatus,
  getEstimatedMarks,
} from '@/data/ceeExamPlanner'
import { cn } from '@/utils/tailwind'

const storageKey = 'medqas-cee-exam-planner-v1'

const statusOptions: Array<{
  value: ExamPlannerStatus
  label: string
  shortLabel: string
}> = [
  { value: 'not-started', label: 'Not started', shortLabel: 'Start' },
  { value: 'in-progress', label: 'In progress', shortLabel: 'Doing' },
  { value: 'ready', label: 'Ready', shortLabel: 'Ready' },
]

const subjectIcons = {
  physics: Atom,
  chemistry: FlaskConical,
  zoology: Dna,
  botany: Leaf,
  mat: Calculator,
}

const subjectAccent = {
  physics: 'border-sky-200 bg-sky-50 text-sky-700',
  chemistry: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  zoology: 'border-rose-200 bg-rose-50 text-rose-700',
  botany: 'border-lime-200 bg-lime-50 text-lime-700',
  mat: 'border-amber-200 bg-amber-50 text-amber-700',
}

function formatMarks(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function formatRank(value: number) {
  return Math.max(1, Math.round(value)).toLocaleString()
}

const ceeMarksRankAnchors = [
  { marks: 200, rank: 1 },
  { marks: 190, rank: 20 },
  { marks: 180, rank: 80 },
  { marks: 170, rank: 180 },
  { marks: 160, rank: 400 },
  { marks: 150, rank: 750 },
  { marks: 140, rank: 1300 },
  { marks: 130, rank: 2100 },
  { marks: 120, rank: 3200 },
  { marks: 110, rank: 4500 },
  { marks: 100, rank: 5800 },
  { marks: 90, rank: 7000 },
  { marks: 0, rank: 8000 },
]

function getEstimatedRank(marks: number, totalMarks: number) {
  if (marks <= 0 || totalMarks <= 0) {
    return null
  }

  const normalizedMarks = Math.max(0, Math.min(totalMarks, marks))
  const upperAnchor =
    ceeMarksRankAnchors.find((anchor) => normalizedMarks >= anchor.marks) ??
    ceeMarksRankAnchors[ceeMarksRankAnchors.length - 1]
  const upperIndex = ceeMarksRankAnchors.indexOf(upperAnchor)
  const lowerAnchor =
    ceeMarksRankAnchors[upperIndex - 1] ?? ceeMarksRankAnchors[0]
  const marksSpan = lowerAnchor.marks - upperAnchor.marks
  const rankSpan = upperAnchor.rank - lowerAnchor.rank
  const progress =
    marksSpan > 0 ? (lowerAnchor.marks - normalizedMarks) / marksSpan : 0
  const rank = lowerAnchor.rank + rankSpan * progress
  const variance = rank <= 500 ? 0.18 : rank <= 2000 ? 0.22 : 0.28
  const low = Math.max(1, rank * (1 - variance))
  const high = Math.max(low + 1, rank * (1 + variance))

  return {
    rank,
    low,
    high,
  }
}

export function ExamPlannerClient() {
  const [statuses, setStatuses] = useState<Record<string, ExamPlannerStatus>>(
    {},
  )
  const [activeSubjectSlug, setActiveSubjectSlug] = useState(
    ceeExamPlannerSubjects[0]?.slug ?? 'physics',
  )

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey)
      if (saved) {
        setStatuses(JSON.parse(saved))
      }
    } catch {
      setStatuses({})
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(statuses))
  }, [statuses])

  const subjectSummaries = useMemo(() => {
    return ceeExamPlannerSubjects.map((subject) => {
      const rawEstimated = subject.chapters.reduce((sum, chapter) => {
        return sum + getEstimatedMarks(chapter, statuses[chapter.id])
      }, 0)
      const estimated = Math.min(rawEstimated, subject.totalMarks)
      const readyChapters = subject.chapters.filter(
        (chapter) => statuses[chapter.id] === 'ready',
      ).length
      const inProgressChapters = subject.chapters.filter(
        (chapter) => statuses[chapter.id] === 'in-progress',
      ).length

      return {
        ...subject,
        estimated,
        progress: subject.totalMarks
          ? Math.min(100, (estimated / subject.totalMarks) * 100)
          : 0,
        readyChapters,
        inProgressChapters,
      }
    })
  }, [statuses])

  const activeSubject =
    subjectSummaries.find((subject) => subject.slug === activeSubjectSlug) ??
    subjectSummaries[0]

  const totalEstimated = subjectSummaries.reduce(
    (sum, subject) => sum + subject.estimated,
    0,
  )
  const totalMarks = subjectSummaries.reduce(
    (sum, subject) => sum + subject.totalMarks,
    0,
  )
  const estimatedRank = getEstimatedRank(totalEstimated, totalMarks)
  const readyCount = Object.values(statuses).filter(
    (status) => status === 'ready',
  ).length
  const inProgressCount = Object.values(statuses).filter(
    (status) => status === 'in-progress',
  ).length
  const activeUnits = useMemo(() => {
    return activeSubject.chapters.reduce<
      Array<{
        title: string
        chapters: typeof activeSubject.chapters
        estimated: number
        max: number
      }>
    >((groups, chapter) => {
      let group = groups.find((item) => item.title === chapter.unit)

      if (!group) {
        group = {
          title: chapter.unit,
          chapters: [],
          estimated: 0,
          max: 0,
        }
        groups.push(group)
      }

      group.chapters.push(chapter)
      group.estimated += getEstimatedMarks(
        chapter,
        statuses[chapter.id] ?? 'not-started',
      )
      group.max += chapter.marks.max

      return groups
    }, [])
  }, [activeSubject, statuses])

  function updateStatus(chapterId: string, status: ExamPlannerStatus) {
    setStatuses((previous) => ({
      ...previous,
      [chapterId]: status,
    }))
  }

  function resetPlanner() {
    setStatuses({})
  }

  return (
    <div className="w-full px-1 py-2 sm:px-4">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="border-primary/15 mb-3 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              CEE preparation tracker
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Exam Tracker
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Mark each chapter as ready, in progress, or not started. Ready
              chapters count their estimated marks; in-progress chapters count
              the midpoint of their mark range.
            </p>
          </div>
          <button
            type="button"
            onClick={resetPlanner}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
          <div className="rounded-lg border bg-background/95 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Estimated marks
                </div>
                <div className="mt-1 text-4xl font-semibold">
                  {formatMarks(totalEstimated)}
                  <span className="text-lg text-muted-foreground">
                    {' '}
                    / {totalMarks}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:w-72">
                <SummaryStat label="Ready" value={readyCount} />
                <SummaryStat label="In progress" value={inProgressCount} />
              </div>
            </div>
            <Progress
              value={totalMarks ? (totalEstimated / totalMarks) * 100 : 0}
              className="mt-5"
            />
          </div>

          <div className="rounded-lg border bg-background/95 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
              Rank estimator
            </div>
            <div className="mt-4 rounded-md border bg-muted/25 p-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">
                Estimated rank
              </div>
              <div className="mt-1 text-2xl font-semibold text-primary">
                {estimatedRank
                  ? `${formatRank(estimatedRank.low)}-${formatRank(
                      estimatedRank.high,
                    )}`
                  : 'Add marks'}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Based on {formatMarks(totalEstimated)} estimated marks
              </div>
            </div>
            {estimatedRank ? (
              <div className="mt-3 rounded-md border bg-background px-3 py-2">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Mid estimate
                </div>
                <div className="mt-1 text-sm font-semibold">
                  Rank around {formatRank(estimatedRank.rank)}
                </div>
              </div>
            ) : null}
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Uses a CEE-sized marks-to-rank curve with interpolation between
              score anchors. Treat it as planning guidance, not an official
              result.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/25 p-5">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
            <div>
              <div className="text-sm font-semibold">Exam pattern</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Subject totals used for the tracker estimate.
              </p>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              {subjectSummaries.map((subject) => (
                <div
                  key={subject.slug}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-muted-foreground">{subject.name}</span>
                  <span className="font-semibold">
                    {subject.totalMarks} marks
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {subjectSummaries.map((subject) => {
            const Icon =
              subjectIcons[subject.slug as keyof typeof subjectIcons] ?? Circle
            const selected = subject.slug === activeSubject.slug

            return (
              <button
                key={subject.slug}
                type="button"
                onClick={() => setActiveSubjectSlug(subject.slug)}
                className={cn(
                  'rounded-lg border bg-background/90 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  selected && 'border-primary/40 bg-primary/5 shadow-md',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border',
                      subjectAccent[subject.slug as keyof typeof subjectAccent],
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{subject.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatMarks(subject.estimated)} / {subject.totalMarks}
                    </span>
                  </span>
                </div>
                <Progress value={subject.progress} className="mt-3 h-1.5" />
              </button>
            )
          })}
        </div>

        <div className="mt-6">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{activeSubject.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeSubject.readyChapters} ready,{' '}
                {activeSubject.inProgressChapters} in progress,{' '}
                {activeSubject.chapters.length} chapters
              </p>
            </div>
            <div className="text-sm font-semibold text-muted-foreground">
              {formatMarks(activeSubject.estimated)} /{' '}
              {activeSubject.totalMarks} marks
            </div>
          </div>

          <div className="grid gap-4">
            {activeUnits.map((unit) => (
              <section
                key={unit.title}
                className="overflow-hidden rounded-lg border bg-background/95 shadow-sm"
              >
                <div className="border-b bg-muted/30 px-4 py-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{unit.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {unit.chapters.length} chapters
                      </p>
                    </div>
                    <div className="w-full sm:w-56">
                      <div className="mb-1 flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>{formatMarks(unit.estimated)} estimated</span>
                        <span>{formatMarks(unit.max)} max</span>
                      </div>
                      <Progress
                        value={unit.max ? (unit.estimated / unit.max) * 100 : 0}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                  {unit.chapters.map((chapter) => {
                    const status = statuses[chapter.id] ?? 'not-started'
                    const estimated = getEstimatedMarks(chapter, status)

                    return (
                      <article
                        key={chapter.id}
                        className={cn(
                          'rounded-md border bg-background p-3 transition-colors',
                          status === 'ready' &&
                            'border-emerald-200 bg-emerald-50/50',
                          status === 'in-progress' &&
                            'border-amber-200 bg-amber-50/50',
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold leading-5">
                              {chapter.title}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Range {chapter.marks.min}-{chapter.marks.max}{' '}
                              marks
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-semibold leading-5">
                              {formatMarks(estimated)}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold uppercase text-muted-foreground">
                              marks
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-md border bg-background">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              title={option.label}
                              onClick={() =>
                                updateStatus(chapter.id, option.value)
                              }
                              className={cn(
                                'inline-flex h-9 items-center justify-center gap-1 border-r px-2 text-xs font-semibold text-muted-foreground last:border-r-0 hover:bg-primary/5 hover:text-primary',
                                status === option.value &&
                                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                              )}
                            >
                              {status === option.value ? (
                                <CheckCircle2
                                  className="h-3.5 w-3.5"
                                  aria-hidden
                                />
                              ) : null}
                              {option.shortLabel}
                            </button>
                          ))}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-background px-3 py-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  )
}
