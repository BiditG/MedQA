'use client'

import { useEffect, useState } from 'react'

export type UserStats = {
  user_id: string
  total_mcqs: number
  total_correct: number
  xp: number
  rank: number | null
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // For now, our app does not have a stats endpoint. Use /api/auth/me to
        // detect signed-in user and return default stats until a proper API is
        // implemented.
        const res = await fetch('/api/auth/me')
        if (!mounted) return
        if (!res.ok) {
          setStats(null)
          return
        }
        const json = await res.json()
        const userId = json?.user?.id
        if (!userId) {
          setStats(null)
          return
        }
        setStats({
          user_id: userId,
          total_mcqs: 0,
          total_correct: 0,
          xp: 0,
          rank: null,
        })
      } catch (e: any) {
        if (!mounted) return
        setError(e?.message || 'Failed to load stats')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return { stats, loading, error }
}
