'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function AnimatedBars() {
  // Wider, fewer bars for a bolder visual
  const bars = [36, 58, 44, 72, 50, 64, 38]
  const prefersReduced = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener?.('change', update)
    return () => mq.removeEventListener?.('change', update)
  }, [])

  const reduce = prefersReduced || isMobile

  return (
    <div className="pointer-events-none mx-auto mt-8 flex h-40 items-end justify-center gap-3 opacity-95 sm:h-48 md:h-60">
      {bars.map((h, i) => {
        const baseWidth = i % 2 === 0 ? 'w-4 sm:w-6' : 'w-5 sm:w-7'
        const start = `${Math.max(12, h - 12)}%`
        const end = `${h}%`

        return (
          <motion.div
            key={i}
            role="img"
            aria-hidden
            className={`${baseWidth} rounded-md bg-gradient-to-t from-primary/30 to-primary/80 shadow-sm`}
            initial={reduce ? { height: end } : { height: start }}
            animate={reduce ? { height: end } : { height: [start, end, start] }}
            transition={
              reduce
                ? undefined
                : {
                    duration: 2 + (i % 3) * 0.35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        )
      })}
    </div>
  )
}
