import Link from 'next/link'
import { ArrowRight, Clock3, HelpCircle } from 'lucide-react'
import { OneShotNote, subjectToSlug } from '@/data/oneShotNotes'
import { ImportanceBadge } from './badges'

export function OneShotNoteCard({ note }: { note: OneShotNote }) {
  return (
    <article className="group rounded-lg border bg-background/95 p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5">
      <div className="flex flex-wrap gap-2">
        <ImportanceBadge importance={note.importance} />
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6">{note.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {note.chapter}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
          {note.readingTime}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-primary" aria-hidden />
          {note.mcqs.length} MCQs
        </span>
        <span>{note.subject}</span>
        <span>{note.topic}</span>
      </div>
      <Link
        href={`/one-shot-notes/${subjectToSlug(note.subject)}/${note.slug}`}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Start Revision
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </article>
  )
}
