import { useEffect, useMemo, useRef, useState } from 'react'

export function formatTime(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Timer({
  durationMs,
  running,
  onExpire,
}: {
  durationMs: number
  running: boolean
  onExpire: () => void
}) {
  const [remaining, setRemaining] = useState(durationMs)
  const raf = useRef<number | null>(null)
  const start = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) return
    const step = (ts: number) => {
      if (start.current == null) start.current = ts
      const elapsed = ts - start.current
      const left = durationMs - elapsed
      setRemaining(left)
      if (left <= 0) {
        onExpire()
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = null
      start.current = null
    }
  }, [running, durationMs, onExpire, remaining])

  const text = useMemo(() => formatTime(remaining), [remaining])
  return <span aria-live="polite">{text}</span>
}
