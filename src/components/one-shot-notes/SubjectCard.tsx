import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { OneShotSubjectSummary, getSubjectNoteCount } from '@/data/oneShotNotes'
import { cn } from '@/utils/tailwind'

export function SubjectCard({ subject }: { subject: OneShotSubjectSummary }) {
  const Icon = subject.icon

  return (
    <Link
      href={`/one-shot-notes/${subject.slug}`}
      className="group rounded-lg border bg-background/95 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-md ring-1',
          subject.accentClass,
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{subject.name}</h3>
      <p className="min-h-12 mt-2 text-sm leading-6 text-muted-foreground">
        {subject.description}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {getSubjectNoteCount(subject.name)} notes
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          View Notes
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )
}
