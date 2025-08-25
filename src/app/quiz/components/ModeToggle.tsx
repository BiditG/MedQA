import { Button } from '@/components/ui/button'
import { cn } from '@/utils/tailwind'

export type Mode = 'casual' | 'exam'

export function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (m: Mode) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border p-1">
      {(
        [
          { key: 'casual', label: 'Casual' },
          { key: 'exam', label: 'Exam' },
        ] as const
      ).map((m) => (
        <Button
          key={m.key}
          type="button"
          onClick={() => onChange(m.key)}
          variant={mode === m.key ? 'default' : 'ghost'}
          className={cn(
            'h-8 rounded-full px-3 text-sm',
            mode === m.key ? '' : 'bg-transparent',
          )}
          aria-pressed={mode === m.key}
        >
          {m.label}
        </Button>
      ))}
    </div>
  )
}
