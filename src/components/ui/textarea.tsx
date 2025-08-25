import * as React from 'react'
import { cn } from '@/utils/tailwind'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm outline-none',
      'ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'
