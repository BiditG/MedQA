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
    // Reset remaining when duration changes or when not running
    setRemaining(durationMs)
    // If not running, clear any animation frame and exit
    if (!running) {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = null
      start.current = null
      return
    }

    // Start the RAF loop
    const step = (ts: number) => {
      if (start.current == null) start.current = ts
      const elapsed = ts - start.current
      const left = Math.max(0, durationMs - elapsed)
      setRemaining(left)
      if (left <= 0) {
        // ensure we clear raf and notify once
        if (raf.current) {
          cancelAnimationFrame(raf.current)
          raf.current = null
        }
        start.current = null
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
    // intentionally do not depend on `remaining` to avoid cancelling the RAF every tick
  }, [running, durationMs, onExpire])

  const text = useMemo(() => formatTime(remaining), [remaining])
  return <span aria-live="polite">{text}</span>
}
