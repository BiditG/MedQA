import Link from 'next/link'
import { Brain, Sparkles } from 'lucide-react'

export function Hero({
  onMobileStartClick,
}: {
  onMobileStartClick?: () => void
}) {
  return (
    <section className="w-full border-b border-border/50">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            <span className="font-medium">AI-assisted medical prep</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Master medicine with focused MCQs and AI guidance
          </h1>
          <p className="max-w-prose text-sm text-muted-foreground sm:text-base">
            Practice exam-style questions across systems, get clear
            explanations, and chat with an AI tutor to close knowledge gaps
            fast.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#start"
              onClick={(e) => {
                try {
                  if (
                    typeof window !== 'undefined' &&
                    window.matchMedia('(max-width: 639px)').matches
                  ) {
                    e.preventDefault()
                    onMobileStartClick?.()
                  }
                } catch {}
              }}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              START MCQ
            </a>
            <Link
              href="/tutor"
              className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Ask AI Tutor
            </Link>
          </div>
        </div>
        <div className="relative isolate hidden select-none sm:block">
          <div
            className="via-cyan-400/15 dark:from-sky-500/15 dark:to-emerald-500/15 absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-sky-400/25 to-emerald-400/20 blur-2xl dark:via-cyan-500/10"
            aria-hidden
          />
          <div className="rounded-3xl border bg-background/60 p-6 shadow-md backdrop-blur">
            <div className="bg-primary/15 mx-auto flex h-28 w-28 items-center justify-center rounded-2xl text-primary">
              <Brain className="h-10 w-10" aria-hidden />
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
              <li className="rounded-lg border p-3">Clinical reasoning</li>
              <li className="rounded-lg border p-3">Exam strategies</li>
              <li className="rounded-lg border p-3">3D anatomy</li>
              <li className="rounded-lg border p-3">PDF → MCQs</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
