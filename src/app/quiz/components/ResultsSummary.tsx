import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type Breakdown = { correct: number; wrong: number; skipped: number }

export function ResultsSummary({
  score,
  max,
  breakdown,
  onRetry,
  onReview,
  onExport,
}: {
  score: number
  max: number
  breakdown: Breakdown
  onRetry: () => void
  onReview: () => void
  onExport: () => void
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 text-3xl font-semibold">Nice work! 🎉</div>
      <p className="mb-6 text-muted-foreground">
        Assessment complete — here’s your summary.
      </p>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-5xl font-bold">{score.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            out of {max} • {pct}%
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">Correct</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-300">
                {breakdown.correct}
              </div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">Wrong</div>
              <div className="font-semibold text-rose-600 dark:text-rose-300">
                {breakdown.wrong}
              </div>
            </div>
            <div className="rounded-md border p-2">
              <div className="text-xs text-muted-foreground">Skipped</div>
              <div className="font-semibold text-slate-600 dark:text-slate-300">
                {breakdown.skipped}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button onClick={onRetry}>Retry</Button>
        <Button variant="outline" onClick={onReview}>
          Review mistakes
        </Button>
        <Button variant="outline" onClick={onExport}>
          Export Score (JSON)
        </Button>
      </div>
    </div>
  )
}
