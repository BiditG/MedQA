'use client'

import { Loader2 } from 'lucide-react'

export function Spinner({
  className = 'h-4 w-4 text-muted-foreground',
}: {
  className?: string
}) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />
}
