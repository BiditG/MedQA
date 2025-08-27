import { Badge } from '@/components/ui/badge'

export function QuizHeader({
  title = 'Practice Quiz',
  subtitle = "You've got this!",
  index,
  total,
  score,
}: {
  title?: string
  subtitle?: string
  index: number
  total: number
  score: number
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-primary/20 bg-primary/10 text-xs text-primary sm:text-sm">
            {index + 1} / {total}
          </Badge>
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-500 sm:text-sm">
            Score: {score}
          </Badge>
        </div>
      </div>
    </div>
  )
}
