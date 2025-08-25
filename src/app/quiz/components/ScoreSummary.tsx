import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ScoreSummary({
  score,
  total,
  onRestart,
  onExport,
}: {
  score: number
  total: number
  onRestart: () => void
  onExport: () => void
}) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="mb-4 text-3xl font-semibold">Nice work! 🎉</div>
      <p className="mb-6 text-muted-foreground">
        Solid effort—keep building momentum.
      </p>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Your Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 text-5xl font-bold">{score}</div>
          <div className="text-sm text-muted-foreground">
            out of {total} • {pct}%
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button onClick={onRestart}>Try Again</Button>
        <Button variant="outline" onClick={onExport}>
          Export Score (JSON)
        </Button>
      </div>
    </div>
  )
}
