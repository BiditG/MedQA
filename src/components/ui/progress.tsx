import * as React from 'react'
import { cn } from '@/utils/tailwind'

type Props = React.HTMLAttributes<HTMLDivElement> & { value?: number }

export function Progress({ className, value = 0, ...props }: Props) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      role="progressbar"
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 rounded-full bg-primary transition-all"
        style={{ transform: `translateX(-${100 - clamped}%)` }}
      />
    </div>
  )
}
