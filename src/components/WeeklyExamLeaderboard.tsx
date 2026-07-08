'use client'

import { useEffect, useState } from 'react'
import { Medal, RefreshCw, Trophy } from 'lucide-react'

type WindowFilter = '24h' | '7d' | 'lifetime'

type LeaderboardRow = {
  rank: number
  id: string
  name: string
  anonymous: boolean
  totalScore: number
  biologyScore: number
  correctCount: number
  wrongCount: number
  unansweredCount: number
  totalQuestions: number
  submittedAt: string
}

const filters: { value: WindowFilter; label: string }[] = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last week' },
  { value: 'lifetime', label: 'Lifetime' },
]

export default function WeeklyExamLeaderboard() {
  const [windowFilter, setWindowFilter] = useState<WindowFilter>('7d')
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(
        `/api/weekly-exam/leaderboard?window=${windowFilter}`,
      )
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to load rankings')
      setRows(data.results || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load rankings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [windowFilter])

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-primary/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold">Rankings</h2>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Refresh
          </button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-md bg-background p-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setWindowFilter(filter.value)}
              className={`rounded px-2 py-1.5 text-xs font-semibold transition-colors ${
                windowFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
            Loading rankings...
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
            No submitted exams yet.
          </div>
        ) : (
          <div className="divide-y rounded-lg border bg-background">
            {rows.map((row) => (
              <RankingRow key={row.id} row={row} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function RankingRow({ row }: { row: LeaderboardRow }) {
  return (
    <div className="grid grid-cols-[56px_1fr_auto] items-center gap-3 px-4 py-4">
      <div className="flex items-center gap-2">
        {row.rank <= 3 ? (
          <Medal
            className={`h-5 w-5 ${
              row.rank === 1
                ? 'text-amber-500'
                : row.rank === 2
                  ? 'text-slate-500'
                  : 'text-orange-500'
            }`}
            aria-hidden
          />
        ) : null}
        <span className="font-semibold">#{row.rank}</span>
      </div>

      <div className="min-w-0">
        <div className="truncate font-semibold">{row.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Biology: {row.biologyScore.toFixed(2)}
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold">{row.totalScore.toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">marks</div>
      </div>
    </div>
  )
}
