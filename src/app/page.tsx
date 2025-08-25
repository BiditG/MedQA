'use client'

import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { Hero } from './(home)/components/Hero'
import { FilterPanel, type FilterState } from './(home)/components/FilterPanel'
import { StatsPreview } from './(home)/components/StatsPreview'
import { QuickActions } from './(home)/components/QuickActions'
import { RecentPills } from './(home)/components/RecentPills'
import { StartBar } from './(home)/components/StartBar'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

function HomeInner() {
  const router = useRouter()
  const params = useSearchParams()

  const initial: FilterState = {
    subject: params.get('subject') || '',
    topic: params.get('topic') || '',
    mode: (params.get('mode') as any) || 'casual',
    count: Number(params.get('count') || 10),
  }
  const [filters, setFilters] = useState<FilterState>(initial)

  // Keep URL in sync (stable callback for exhaustive-deps)
  const syncUrl = useCallback(
    (next: FilterState) => {
      const qs = new URLSearchParams()
      if (next.subject) qs.set('subject', next.subject)
      if (next.topic) qs.set('topic', next.topic)
      if (next.mode) qs.set('mode', next.mode)
      if (next.count) qs.set('count', String(next.count))
      router.replace(qs.toString() ? `/?${qs.toString()}` : '/')
    },
    [router],
  )

  useEffect(() => {
    syncUrl(filters)
  }, [filters, syncUrl])

  const onStart = () => {
    const qs = new URLSearchParams()
    if (filters.subject) qs.set('subject', filters.subject)
    if (filters.topic) qs.set('topic', filters.topic)
    if (filters.mode) qs.set('mode', filters.mode)
    if (filters.count) qs.set('count', String(filters.count))
    router.push(`/quiz?${qs.toString()}`)
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      {/* Top nav */}
      <nav className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-base font-semibold">
            MedPrep MCQs
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/quiz"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Quiz
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <Hero />

      {/* Main content */}
      <section className="w-full">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <FilterPanel
              value={filters}
              onChange={setFilters}
              canStart={true}
              onStart={onStart}
              onUrlSync={syncUrl}
            />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  href: '/tutor',
                  title: 'AI Tutor',
                  desc: 'Chat with an explainer bot.',
                },
                {
                  href: '/pdf-to-mcq',
                  title: 'PDF → MCQ',
                  desc: 'Turn files into questions.',
                },
                {
                  href: '/visualize',
                  title: '3D Viz',
                  desc: 'Explore anatomy (UI only).',
                },
                {
                  href: '/diagnose',
                  title: 'Diagnose with AI',
                  desc: 'Guess the diagnosis.',
                },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="rounded-2xl border p-4 transition-colors hover:bg-accent/40"
                >
                  <div className="text-lg font-medium">{c.title}</div>
                  <div className="text-sm text-muted-foreground">{c.desc}</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:col-span-1">
            <StatsPreview subject={filters.subject} topic={filters.topic} />
            <QuickActions />
          </div>
        </div>
      </section>

      <RecentPills
        onPick={(r) =>
          setFilters((f) => ({
            ...f,
            subject: r.subject || '',
            topic: r.topic || '',
          }))
        }
      />

      <footer className="w-full border-t border-t-foreground/10 p-8 text-center text-xs">
        <p className="mb-2 text-muted-foreground">
          Built with Next.js, Tailwind, and Supabase
        </p>
      </footer>

      <StartBar
        mode={filters.mode}
        subject={filters.subject}
        topic={filters.topic}
        count={filters.count}
        canStart={true}
        onStart={onStart}
      />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={<div className="w-full max-w-6xl px-4 py-8">Loading…</div>}
    >
      <HomeInner />
    </Suspense>
  )
}
