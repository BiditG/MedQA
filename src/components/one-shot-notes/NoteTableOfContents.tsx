'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/tailwind'

const items = [
  ['concept', 'Concept'],
  ['must-remember', 'Must Remember'],
  ['diagram', 'Diagram in Words'],
  ['key-section', 'Formula / Reaction / Key Table'],
  ['cee-traps', 'CEE Traps'],
  ['common-mistakes', 'Common Mistakes'],
  ['quick-mcqs', 'Quick MCQs'],
  ['final-revision', 'Final Revision Box'],
] as const

export function NoteTableOfContents() {
  const [open, setOpen] = useState(false)

  return (
    <aside className="sticky top-20 rounded-lg border bg-background/95 p-3 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-semibold lg:pointer-events-none"
        aria-expanded={open}
      >
        Quick Navigation
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform lg:hidden',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      <nav className={cn('mt-3 grid gap-1 lg:grid', open ? 'grid' : 'hidden')}>
        {items.map(([href, label]) => (
          <a
            key={href}
            href={`#${href}`}
            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-primary/5 hover:text-primary"
          >
            {label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
