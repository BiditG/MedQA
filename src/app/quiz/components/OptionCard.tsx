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
      'bg-emerald-100/30 dark:bg-emerald-500/10 border-emerald-400/60 text-emerald-700 dark:text-emerald-300',
    wrong:
      'bg-rose-100/30 dark:bg-rose-500/10 border-rose-400/60 text-rose-700 dark:text-rose-300',
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
      className={cn(base, states[state])}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-full border text-xs font-medium">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="leading-relaxed">{children}</span>
      </div>
    </button>
  )
}
