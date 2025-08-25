'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createBrowserClient } from '@/utils/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mode, ModeToggle } from '@/app/quiz/components/ModeToggle'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../../components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { SlidersHorizontal } from 'lucide-react'

function normalizeStr(x?: string | null) {
  return (x ?? '').toString().trim()
}

export type FilterState = {
  subject: string
  topic: string
  mode: Mode
  count: number
}

export function FilterPanel({
  value,
  onChange,
  canStart,
  onStart,
  onUrlSync,
}: {
  value: FilterState
  onChange: (next: FilterState) => void
  canStart: boolean
  onStart: () => void
  onUrlSync: (next: FilterState) => void
}) {
  const [open, setOpen] = useState(false)
  // subjects
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from('mcqs').select('subject')
      if (error) throw error
      const set = new Set<string>()
      for (const row of data ?? []) {
        const s = normalizeStr((row as any).subject)
        if (s) set.add(s)
      }
      return Array.from(set).sort()
    },
    staleTime: 5 * 60_000,
  })

  // topics for selected subject
  const { data: topics, isLoading: loadingTopics } = useQuery({
    queryKey: ['topics', value.subject],
    queryFn: async () => {
      if (!value.subject) return [] as string[]
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from('mcqs')
        .select('topic')
        .eq('subject', value.subject)
      if (error) throw error
      const set = new Set<string>()
      for (const row of data ?? []) {
        const t = normalizeStr((row as any).topic)
        if (t) set.add(t)
      }
      return Array.from(set).sort()
    },
    enabled: !!value.subject,
    staleTime: 5 * 60_000,
  })

  // count preview
  const { data: availableCount, isLoading: loadingCount } = useQuery({
    queryKey: ['count', value.subject, value.topic],
    queryFn: async () => {
      const supabase = createBrowserClient()
      let q = supabase.from('mcqs').select('*', { count: 'exact', head: true })
      if (value.subject) q = q.eq('subject', value.subject)
      if (value.topic) q = q.eq('topic', value.topic)
      const { count, error } = await q
      if (error) throw error
      return count ?? 0
    },
    staleTime: 60_000,
  })

  // url + localStorage persistence
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recentFilters')
      const arr = raw ? JSON.parse(raw) : []
      const entry = {
        subject: value.subject || undefined,
        topic: value.topic || undefined,
      }
      const key = JSON.stringify(entry)
      const next = [entry, ...arr.filter((x: any) => JSON.stringify(x) !== key)]
      localStorage.setItem('recentFilters', JSON.stringify(next.slice(0, 20)))
    } catch {}
  }, [value.subject, value.topic])

  const disabled = loadingSubjects || loadingTopics
  const canStartNow = canStart && (availableCount ?? 0) > 0

  const Panel = (
    <div className="grid gap-4" id="start" aria-live="polite">
      {/* Subject */}
      <div>
        <label className="mb-1 block text-xs font-medium">Subject</label>
        {loadingSubjects ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <select
            value={value.subject}
            onChange={(e) =>
              onChange({ ...value, subject: e.target.value, topic: '' })
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/50"
            disabled={disabled}
            aria-label="Subject"
          >
            <option value="">Any subject</option>
            {(subjects ?? []).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          Pick a subject to filter topics.
        </p>
      </div>

      {/* Topic */}
      <div>
        <label className="mb-1 block text-xs font-medium">Topic</label>
        {loadingTopics && value.subject ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <select
            value={value.topic}
            onChange={(e) => onChange({ ...value, topic: e.target.value })}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary/50"
            disabled={disabled || !value.subject}
            aria-label="Topic"
          >
            <option value="">All topics</option>
            {(topics ?? []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
        <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
          {value.subject ? 'Topics updated.' : 'Pick a subject to see topics.'}
        </p>
      </div>

      {/* Mode */}
      <div>
        <label className="mb-1 block text-xs font-medium">Mode</label>
        <ModeToggle
          mode={value.mode}
          onChange={(m) => {
            const next = { ...value, mode: m }
            onChange(next)
            onUrlSync(next)
          }}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Casual: explanations; Exam: timer + negative marking
        </p>
      </div>

      {/* Count */}
      <div>
        <label className="mb-1 block text-xs font-medium">Question count</label>
        <div className="flex gap-2">
          {[10, 20, 30].map((n) => (
            <Button
              key={n}
              type="button"
              variant={value.count === n ? 'default' : 'outline'}
              onClick={() => onChange({ ...value, count: n })}
              className="h-8"
              aria-pressed={value.count === n}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-muted-foreground" role="status">
          ~ {(availableCount ?? 0).toLocaleString()} questions match your
          filters
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = {
                subject: '',
                topic: '',
                mode: 'casual' as Mode,
                count: 10,
              }
              onChange(next)
              onUrlSync(next)
            }}
          >
            Reset
          </Button>
          <Button type="button" onClick={onStart} disabled={!canStartNow}>
            Start
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative">
      {/* Desktop */}
      <Card className="hidden shadow-md md:block">
        <CardHeader>
          <CardTitle>Choose your practice</CardTitle>
        </CardHeader>
        <CardContent>{Panel}</CardContent>
      </Card>

      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Choose your practice</SheetTitle>
              <SheetDescription>
                Select subject, topic, mode, and count.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-4">{Panel}</div>
            <div className="sticky bottom-0 mt-6 flex items-center justify-between border-t bg-background/70 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const next = {
                    subject: '',
                    topic: '',
                    mode: 'casual' as Mode,
                    count: 10,
                  }
                  onChange(next)
                  onUrlSync(next)
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onStart()
                  setOpen(false)
                }}
                disabled={!canStartNow}
              >
                Start
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
