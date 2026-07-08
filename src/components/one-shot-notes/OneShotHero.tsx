import Link from 'next/link'
import { ArrowRight, BookOpenCheck, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OneShotHero() {
  return (
    <section className="rounded-lg border bg-background/95 p-5 shadow-sm sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpenCheck className="h-3.5 w-3.5" aria-hidden />
            One Shot Notes
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Revise CEE Topics in One Shot
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Revise any CEE topic in minutes. Colorful, CEE-focused revision
            notes with diagrams, traps, formulas, and MCQs made for fast
            last-minute preparation.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="#one-shot-notes-list">
                Start Revision
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" aria-hidden />
                View Premium Notes
              </Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-sm font-semibold">Built for CEE speed</div>
          <div className="mt-4 grid gap-3">
            {[
              'Diagrams in words',
              'CEE traps',
              'Formula tables',
              'Quick MCQs',
            ].map((item) => (
              <div
                key={item}
                className="rounded-md border bg-background px-3 py-2 text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
