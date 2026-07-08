import Link from 'next/link'
import { ArrowRight, Clock3, Layers3 } from 'lucide-react'
import type { FlashcardDeck } from '@/data/flashcards'
import { subjectToSlug } from '@/data/oneShotNotes'
import { cn } from '@/utils/tailwind'

const subjectAccent = {
  Biology: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700',
  Chemistry: 'border-violet-500/20 bg-violet-500/10 text-violet-700',
  Physics: 'border-sky-500/20 bg-sky-500/10 text-sky-700',
  MAT: 'border-amber-500/25 bg-amber-500/10 text-amber-800',
} as const

const cardAccent = {
  Biology: 'from-emerald-500/10 via-background to-teal-500/10',
  Chemistry: 'from-violet-500/10 via-background to-orange-500/10',
  Physics: 'from-sky-500/10 via-background to-cyan-500/10',
  MAT: 'from-amber-500/15 via-background to-indigo-500/10',
} as const

export function FlashcardDeckCard({ deck }: { deck: FlashcardDeck }) {
  return (
    <Link
      href={`/flashcards/${subjectToSlug(deck.subject)}/${deck.slug}`}
      className={cn(
        'hover:border-primary/35 group block rounded-lg border bg-gradient-to-br p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        cardAccent[deck.subject],
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold',
            subjectAccent[deck.subject],
          )}
        >
          {deck.subject}
        </span>
        <ArrowRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-foreground">
        {deck.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {deck.description}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Layers3 className="h-3.5 w-3.5 text-primary" aria-hidden />
          {deck.cardCount} cards
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
          {deck.estimatedTime}
        </span>
        <span className="w-full truncate pt-1">{deck.chapter}</span>
      </div>
    </Link>
  )
}
