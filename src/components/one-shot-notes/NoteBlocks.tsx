import { AlertTriangle, CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  OneShotKeySectionType,
  OneShotMcq,
  OneShotNote,
} from '@/data/oneShotNotes'
import { cn } from '@/utils/tailwind'

export function MustRememberBox({ points }: { points: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {points.map((point) => (
        <div
          key={point}
          className="rounded-md border bg-emerald-500/5 p-3 text-sm leading-6"
        >
          <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" aria-hidden />
          {point}
        </div>
      ))}
    </div>
  )
}

export function DiagramInWordsBox({ value }: { value?: string }) {
  if (!value) return null

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-primary">Diagram in Words</p>
      <p className="mt-3 text-sm leading-7">{value}</p>
    </div>
  )
}

export function CEETrapsBox({ traps }: { traps: string[] }) {
  return (
    <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
        <AlertTriangle className="h-4 w-4" aria-hidden />
        CEE Traps
      </div>
      <ul className="mt-3 grid gap-2 text-sm leading-6">
        {traps.map((trap) => (
          <li key={trap}>- {trap}</li>
        ))}
      </ul>
    </div>
  )
}

export function CommonMistakesBox({ mistakes }: { mistakes: string[] }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-semibold">Common Mistakes</p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
        {mistakes.map((mistake) => (
          <li key={mistake}>- {mistake}</li>
        ))}
      </ul>
    </div>
  )
}

export function KeySectionRenderer({
  keySection,
}: {
  keySection: OneShotNote['keySection']
}) {
  if (!keySection) return null

  const label = getKeySectionLabel(keySection.type)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="border-b bg-muted/50 px-4 py-3">
        <p className="text-sm font-semibold">{keySection.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="divide-y">
        {keySection.items.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[180px_1fr]"
          >
            <div className="font-semibold">{item.label}</div>
            <div className="text-muted-foreground">
              <div>{item.value}</div>
              {item.note ? (
                <div className="mt-1 text-xs">{item.note}</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function FinalRevisionBox({ value }: { value: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/10 p-5">
      <p className="text-sm font-semibold text-primary">
        Final 30-Second Revision
      </p>
      <p className="mt-3 text-sm leading-7">{value}</p>
    </div>
  )
}

export function PdfDownloadButton({ note }: { note: OneShotNote }) {
  if (!note.pdfUrl) {
    return (
      <Button variant="outline" disabled>
        <Download className="mr-2 h-4 w-4" aria-hidden />
        PDF coming soon
      </Button>
    )
  }

  return (
    <Button asChild variant="outline">
      <a href={note.pdfUrl} target="_blank" rel="noreferrer">
        <Download className="mr-2 h-4 w-4" aria-hidden />
        Download PDF
      </a>
    </Button>
  )
}

export function McqAnswer({
  mcq,
  revealed,
}: {
  mcq: OneShotMcq
  revealed: boolean
}) {
  return (
    <div
      className={cn(
        'mt-3 rounded-md border p-3 text-sm leading-6',
        revealed ? 'bg-emerald-500/5' : 'bg-muted/30 text-muted-foreground',
      )}
    >
      {revealed ? (
        <>
          <p className="font-semibold text-emerald-700">Answer: {mcq.answer}</p>
          <p className="mt-1">{mcq.explanation}</p>
        </>
      ) : (
        'Answer hidden. Use Show Answer after attempting.'
      )}
    </div>
  )
}

function getKeySectionLabel(type: OneShotKeySectionType) {
  const labels: Record<OneShotKeySectionType, string> = {
    formula: 'Formula, units, and use cases',
    reaction: 'Reaction, reagent, condition, and product',
    table: 'Compact comparison table',
    flow: 'Process flow for quick recall',
    shortcut: 'Fast-solving checklist',
  }

  return labels[type]
}
