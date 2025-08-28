import { cn } from '@/utils/tailwind'

type State = 'default' | 'hover' | 'selected' | 'correct' | 'wrong' | 'disabled'

export function OptionCard({
  label,
  children,
  state = 'default',
  onClick,
  disabled,
  selected,
  index,
}: {
  label?: string
  children: React.ReactNode
  state?: State
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
  index: number
}) {
  const base =
    'w-full rounded-xl border p-4 text-left text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
  const states: Record<State, string> = {
    default: 'bg-background hover:shadow-sm hover:bg-accent/40',
    hover: 'bg-accent/50 shadow-sm',
    selected: 'bg-primary/5 border-primary text-foreground shadow-sm',
    correct:
      'bg-green-100 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200',
    wrong:
      'bg-red-100 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200',
    disabled: 'opacity-100',
  }

  return (
    <button
      type="button"
      role="radio"
      aria-checked={!!selected}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(base, states[state], 'py-3')}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 shrink-0 select-none items-center justify-center rounded-full border text-sm font-medium">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="whitespace-pre-wrap break-words leading-relaxed">
          {children}
        </span>
      </div>
    </button>
  )
}
