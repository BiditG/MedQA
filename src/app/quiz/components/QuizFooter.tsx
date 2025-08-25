import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export function QuizFooter({
  index,
  total,
  canNext,
  onNext,
}: {
  index: number
  total: number
  canNext: boolean
  onNext: () => void
}) {
  const percent = total > 0 ? Math.round(((index + 1) / total) * 100) : 0
  const isLast = index + 1 >= total
  return (
    <div className="sticky bottom-0 left-0 right-0 mt-6 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-3">
        <div className="flex-1">
          <div className="mb-1 text-xs text-muted-foreground">
            Question {index + 1} of {total}
          </div>
          <Progress value={percent} />
        </div>
        <Button onClick={onNext} disabled={!canNext}>
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
