'use client'

import Link from 'next/link'
import { Hero } from './(home)/components/Hero'
import { FilterPanel, type FilterState } from './(home)/components/FilterPanel'
import { StatsPreview } from './(home)/components/StatsPreview'
import { QuickActions } from './(home)/components/QuickActions'
import { RecentPills } from './(home)/components/RecentPills'
import { StartBar } from './(home)/components/StartBar'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
// AppTopbar is provided by AppShell in layout; avoid double nav
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, FileText, Activity, Box } from 'lucide-react'

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
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

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
      <Hero onMobileStartClick={() => setMobileFiltersOpen(true)} />

      {/* Main content */}
      <section className="w-full">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
          <div className="md:col-span-2 md:pr-2">
            <FilterPanel
              value={filters}
              onChange={setFilters}
              canStart={true}
              onStart={onStart}
              onUrlSync={syncUrl}
              mobileOpen={mobileFiltersOpen}
              onMobileOpenChange={setMobileFiltersOpen}
            />
            <FeatureGrid />
          </div>
          <div className="grid gap-4 md:col-span-1 md:pl-2">
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
        mobileOpen={mobileFiltersOpen}
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

function FeatureGrid() {
  const cards = [
    {
      href: '/tutor',
      title: 'AI Tutor',
      desc: 'Chat with a clinical explainer to deepen understanding.',
      Icon: Brain,
    },
    {
      href: '/pdf-to-mcq',
      title: 'PDF → MCQ',
      desc: 'Transform notes and PDFs into practice questions.',
      Icon: FileText,
    },
    {
      href: '/visualize',
      title: '3D Visualize',
      desc: 'Explore anatomy in 3D (preview).',
      Icon: Box,
    },
    {
      href: '/diagnose',
      title: 'Diagnose with AI',
      desc: 'Interview a simulated patient and find the diagnosis.',
      Icon: Activity,
    },
  ] as const
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map(({ href, title, desc, Icon }) => (
        <Link key={href} href={href} className="group outline-none">
          <Card className="h-full transition-transform group-hover:translate-y-[-2px]">
            <CardHeader className="flex-row items-center gap-3">
              <div className="bg-primary/15 inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary">
                <Icon className="h-4 w-4" aria-hidden />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              {desc}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
