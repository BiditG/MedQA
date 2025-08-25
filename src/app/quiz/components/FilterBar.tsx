import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function FilterBar({
  subject,
  topic,
  setSubject,
  setTopic,
  onApply,
  isBusy,
}: {
  subject: string
  topic: string
  setSubject: (v: string) => void
  setTopic: (v: string) => void
  onApply: () => void
  isBusy?: boolean
}) {
  return (
    <Card className="mb-4">
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Subject
          </label>
          <Input
            placeholder="e.g., Biology"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Topic
          </label>
          <Input
            placeholder="e.g., Genetics"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="sm:w-auto">
          <Button onClick={onApply} disabled={isBusy} className="w-full">
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
