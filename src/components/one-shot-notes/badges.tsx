import { OneShotImportance } from '@/data/oneShotNotes'
import { cn } from '@/utils/tailwind'

export function ImportanceBadge({
  importance,
}: {
  importance: OneShotImportance
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        importance === 'High' && 'bg-red-500/10 text-red-700 ring-red-500/20',
        importance === 'Medium' &&
          'bg-amber-500/10 text-amber-700 ring-amber-500/20',
        importance === 'Low' &&
          'bg-slate-500/10 text-slate-700 ring-slate-500/20',
      )}
    >
      {importance} importance
    </span>
  )
}
