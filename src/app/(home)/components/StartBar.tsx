import { Button } from '@/components/ui/button'

export function StartBar({
  mode,
  subject,
  topic,
  count,
  canStart,
  onStart,
}: {
  mode: string
  subject?: string
  topic?: string
  count: number
  canStart: boolean
  onStart: () => void
}) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:hidden">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 text-sm">
        <div className="truncate">
          <div className="font-medium">
            {mode === 'exam' ? 'Exam' : 'Casual'} mode
          </div>
          <div className="truncate text-muted-foreground">
            {subject || 'Any subject'}
            {topic ? ` • ${topic}` : ''} • {count} q
          </div>
        </div>
        <Button disabled={!canStart} onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  )
}
