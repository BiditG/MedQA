import * as React from 'react'
import { cn } from '@/utils/tailwind'

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        'bg-accent text-foreground',
        className,
      )}
      {...props}
    />
  )
}
