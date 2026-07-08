'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OneShotMcq } from '@/data/oneShotNotes'
import { trackEvent } from '@/utils/analytics'
import { cn } from '@/utils/tailwind'
import { McqAnswer } from './NoteBlocks'

export function MCQAccordion({
  mcqs,
  noteTitle,
}: {
  mcqs: OneShotMcq[]
  noteTitle: string
}) {
  const [openId, setOpenId] = useState<string | undefined>(mcqs[0]?.id)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  return (
    <div className="grid gap-3">
      {mcqs.map((mcq, index) => {
        const open = openId === mcq.id
        const isRevealed = Boolean(revealed[mcq.id])

        return (
          <article key={mcq.id} className="rounded-lg border bg-background">
            <button
              type="button"
              onClick={() => setOpenId(open ? undefined : mcq.id)}
              className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
              aria-expanded={open}
            >
              <span>
                <span className="text-xs font-semibold text-primary">
                  MCQ {index + 1}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6">
                  {mcq.question}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'mt-1 h-4 w-4 shrink-0 transition-transform',
                  open && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
            {open ? (
              <div className="border-t px-4 py-4">
                <div className="grid gap-2 text-sm">
                  <Option label="A" value={mcq.optionA} />
                  <Option label="B" value={mcq.optionB} />
                  <Option label="C" value={mcq.optionC} />
                  <Option label="D" value={mcq.optionD} />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setRevealed((current) => ({ ...current, [mcq.id]: true }))
                    trackEvent('mcq_answer_revealed', {
                      note: noteTitle,
                      mcqId: mcq.id,
                    })
                  }}
                >
                  Show Answer
                </Button>
                <McqAnswer mcq={mcq} revealed={isRevealed} />
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function Option({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <span className="font-semibold">{label}.</span> {value}
    </div>
  )
}
