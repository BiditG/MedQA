import * as React from 'react'
import { cn } from '@/utils/tailwind'

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none',
      'ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
