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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-primary/20 bg-primary/10 text-primary">
            {index + 1} / {total}
          </Badge>
          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
            Score: {score}
          </Badge>
        </div>
      </div>
    </div>
  )
}
