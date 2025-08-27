'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReducedMotion } from 'framer-motion'
import { createBrowserClient } from '@/utils/supabase'

const supabase = createBrowserClient()

async function fetchCount() {
  const res = await supabase
    .from('mcqs')
    .select('*', { head: true, count: 'exact' })
  // supabase-js returns count when head:true
  return Number(res.count ?? 0)
}

export default function AvailableQuestions() {
  const { data: target = 0, isLoading } = useQuery({
    queryKey: ['availableQuestionsCount'],
    queryFn: fetchCount,
    // refresh once a minute to keep the counter fresh
    refetchInterval: 60_000,
  })
  const [display, setDisplay] = useState<number>(0)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (reduceMotion || isLoading) {
      setDisplay(Number(target))
      return
    }

    let raf = 0
    const start = performance.now()
    const from = display
    const to = Number(target)
    const duration = 700

    function step(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const current = Math.floor(from + (to - from) * t)
      setDisplay(current)
      if (t < 1) raf = requestAnimationFrame(step)
    }

    // kick off animation
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // intentionally omit `display` from deps so animation always starts from current render value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, isLoading, reduceMotion])

  // Show a small simplified skeleton while loading
  if (isLoading) {
    return (
      <div className="mx-auto mt-6 flex items-center gap-4 rounded-lg bg-background/50 px-4 py-3 text-sm font-medium">
        <div
          className="h-12 w-12 animate-pulse rounded-full bg-slate-200"
          aria-hidden
        />
        <div className="flex flex-col leading-tight">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <Link
      href="/quiz"
      aria-label={`${target} questions available — start practice`}
      className="mx-auto mt-6 block w-full max-w-3xl rounded-lg bg-background px-4 py-3 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">
              {display.toLocaleString()}
            </span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-300">
              Questions available
            </span>
          </div>
        </div>

        <div className="hidden sm:block">
          <span className="text-primary-700 dark:text-primary-200 inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm font-medium">
            Start practice
          </span>
        </div>
      </div>
    </Link>
  )
}
