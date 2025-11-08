'use client'

import React, { useEffect, useRef, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCw, Coffee } from 'lucide-react'

function formatTime(s: number) {
  const mm = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function PomodoroClean() {
  const [workMinutes, setWorkMinutes] = useState<number>(() =>
    Number(localStorage.getItem('pomodoro:work') ?? 25),
  )
  const [shortBreakMinutes, setShortBreakMinutes] = useState<number>(() =>
    Number(localStorage.getItem('pomodoro:short') ?? 5),
  )
  const [longBreakMinutes, setLongBreakMinutes] = useState<number>(() =>
    Number(localStorage.getItem('pomodoro:long') ?? 15),
  )
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState<number>(() =>
    Number(localStorage.getItem('pomodoro:cycles') ?? 4),
  )

  useEffect(
    () => localStorage.setItem('pomodoro:work', String(workMinutes)),
    [workMinutes],
  )
  useEffect(
    () => localStorage.setItem('pomodoro:short', String(shortBreakMinutes)),
    [shortBreakMinutes],
  )
  useEffect(
    () => localStorage.setItem('pomodoro:long', String(longBreakMinutes)),
    [longBreakMinutes],
  )
  useEffect(
    () => localStorage.setItem('pomodoro:cycles', String(cyclesBeforeLong)),
    [cyclesBeforeLong],
  )

  const [isRunning, setIsRunning] = useState(false)
  const [isWork, setIsWork] = useState(true)
  const [remaining, setRemaining] = useState<number>(() => workMinutes * 60)
  const [completedCycles, setCompletedCycles] = useState<number>(0)
  const intervalRef = useRef<number | null>(null)

  function isLongBreak(cycles: number) {
    return cycles > 0 && cycles % cyclesBeforeLong === 0
  }

  useEffect(() => {
    setRemaining(() =>
      isWork
        ? workMinutes * 60
        : isLongBreak(completedCycles)
          ? longBreakMinutes * 60
          : shortBreakMinutes * 60,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workMinutes, shortBreakMinutes, longBreakMinutes, isWork])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setRemaining((s) => {
          if (s <= 1) {
            window.clearInterval(intervalRef.current ?? undefined)
            intervalRef.current = null
            setIsRunning(false)
            handlePeriodEnd()
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning])

  function beep() {
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.type = 'sine'
      o.frequency.value = 880
      o.connect(g)
      g.connect(ctx.destination)
      o.start()
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
      o.stop(ctx.currentTime + 0.7)
    } catch (e) {
      // ignore audio errors
    }
  }

  async function notify(title: string, body?: string) {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      const p = await Notification.requestPermission()
      if (p === 'granted') new Notification(title, { body })
    }
  }

  function handlePeriodEnd() {
    beep()
    const nextIsWork = !isWork
    setIsWork(nextIsWork)
    if (isWork) {
      setCompletedCycles((c) => c + 1)
    }
    const nextRemaining = nextIsWork
      ? workMinutes * 60
      : isLongBreak(completedCycles + (isWork ? 1 : 0))
        ? longBreakMinutes * 60
        : shortBreakMinutes * 60
    setRemaining(nextRemaining)
    notify(nextIsWork ? 'Work session started' : 'Break time')
  }

  function startPause() {
    setIsRunning((r) => !r)
  }

  function reset() {
    setIsRunning(false)
    setIsWork(true)
    setCompletedCycles(0)
    setRemaining(workMinutes * 60)
  }

  function skip() {
    setIsRunning(false)
    handlePeriodEnd()
  }

  const total = isWork
    ? workMinutes * 60
    : isLongBreak(completedCycles)
      ? longBreakMinutes * 60
      : shortBreakMinutes * 60
  const pct = Math.max(0, Math.min(1, 1 - remaining / Math.max(1, total)))

  function applyPreset(w: number, s: number, l: number) {
    setWorkMinutes(w)
    setShortBreakMinutes(s)
    setLongBreakMinutes(l)
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          title="Pomodoro Timer"
          subtitle="Focus sessions with smart breaks and stats"
        />

        <div className="grid gap-6">
          <div className="prose max-w-none text-sm text-muted-foreground">
            <p className="mt-1">
              The Pomodoro Technique is a simple but powerful time-management
              method that helps you work with sustained focus and regular rest.
              Work in short, dedicated intervals (&quot;pomodoros&quot;),
              typically 25 minutes long, separated by short breaks. After
              completing a set number of pomodoros (commonly four), take a
              longer break to recharge.
            </p>
            <p>
              How it works: the fixed timer creates a sense of urgency that
              reduces procrastination and multitasking. Short breaks prevent
              mental fatigue and allow your brain to consolidate learning. Over
              time, repeated focused intervals build momentum and make large
              tasks feel manageable.
            </p>
            <ul>
              <li>
                <strong>Typical cycle:</strong> 25 minutes work → 5 minutes
                break; after 4 cycles take 15–30 minutes.
              </li>
              <li>
                <strong>Why it helps:</strong> improves concentration, reduces
                burnout, and increases retention.
              </li>
              <li>
                <strong>Study tips:</strong> pick a single clear task per
                pomodoro, remove distractions, and use breaks for light movement
                or rest.
              </li>
            </ul>
          </div>
          <Card>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {/* Task input removed — Pomodoro shows timer only */}
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Mode</div>
                  <div className="mt-1 font-semibold">
                    {isWork ? 'Work' : 'Break'}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-6 md:flex-row">
                <motion.div
                  className="relative flex items-center justify-center"
                  initial={{ scale: 1 }}
                  animate={{ scale: isRunning ? 1.02 : 1 }}
                >
                  <svg
                    viewBox="0 0 36 36"
                    className="h-32 w-32 -rotate-90 transform md:h-40 md:w-40"
                  >
                    <path
                      d="M18 2.0845a15.9155 15.9155 0 1 0 0 31.831"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831"
                      fill="none"
                      stroke="#2acf80"
                      strokeWidth="2"
                      strokeDasharray={`${(pct * 100).toFixed(2)} 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-content-center">
                    <div className="font-mono text-2xl md:text-3xl">
                      {formatTime(remaining)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {completedCycles} cycles
                    </div>
                  </div>
                </motion.div>

                <div className="flex w-full flex-col gap-2 md:w-auto">
                  <div className="flex flex-wrap justify-center gap-2 md:justify-start">
                    <Button
                      onClick={startPause}
                      className="inline-flex w-full items-center gap-2 md:w-auto"
                    >
                      {isRunning ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}{' '}
                      {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={reset}
                      className="inline-flex w-full items-center gap-2 md:w-auto"
                    >
                      <RotateCw className="h-4 w-4" /> Reset
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={skip}
                      className="inline-flex w-full items-center gap-2 md:w-auto"
                    >
                      <Coffee className="h-4 w-4" /> Skip
                    </Button>
                  </div>

                  <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
                    <Button
                      className="w-full md:w-auto"
                      onClick={() => applyPreset(25, 5, 15)}
                    >
                      Classic
                    </Button>
                    <Button
                      className="w-full md:w-auto"
                      onClick={() => applyPreset(50, 10, 30)}
                    >
                      Deep Work
                    </Button>
                    <Button
                      className="w-full md:w-auto"
                      onClick={() => applyPreset(15, 3, 10)}
                    >
                      Quick
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-2">
                <div className="text-xs text-muted-foreground">
                  Customize durations (minutes)
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div>
                    <div className="text-xs">Work</div>
                    <Input
                      className="w-full"
                      type="number"
                      value={String(workMinutes)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setWorkMinutes(Math.max(1, Number(e.target.value || 1)))
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs">Short break</div>
                    <Input
                      className="w-full"
                      type="number"
                      value={String(shortBreakMinutes)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setShortBreakMinutes(
                          Math.max(1, Number(e.target.value || 1)),
                        )
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs">Long break</div>
                    <Input
                      className="w-full"
                      type="number"
                      value={String(longBreakMinutes)}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setLongBreakMinutes(
                          Math.max(1, Number(e.target.value || 1)),
                        )
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">
                    Long break interval (cycles)
                  </div>
                  <Input
                    className="w-full"
                    type="number"
                    value={String(cyclesBeforeLong)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCyclesBeforeLong(
                        Math.max(1, Number(e.target.value || 1)),
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
