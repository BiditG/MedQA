'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'

type Recent = { subject?: string; topic?: string }

export function RecentPills({ onPick }: { onPick: (r: Recent) => void }) {
  const [recents, setRecents] = useState<Recent[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recentFilters')
      if (raw) setRecents(JSON.parse(raw))
    } catch {}
  }, [])

  if (recents.length === 0) return null
  return (
    <div className="mx-auto my-6 max-w-6xl px-4">
      <div className="mb-2 text-sm font-medium">Welcome back</div>
      <div className="flex flex-wrap gap-2">
        {recents.slice(0, 10).map((r, i) => (
          <button
            key={i}
            onClick={() => onPick(r)}
            className="transition-transform hover:scale-[1.02]"
          >
            <Badge className="border-muted-foreground/10 bg-muted text-foreground/80">
              {r.subject}
              {r.topic ? ` • ${r.topic}` : ''}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  )
}
