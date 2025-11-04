'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/utils/supabase-browser'

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
        const supabase = createBrowserClient()
        const { data: u } = await supabase.auth.getUser()
        const userId = u?.user?.id
        if (!userId) {
          setStats(null)
          return
        }
        const { data, error } = await supabase
          .from('profiles') // view/table with pre-aggregated stats
          .select(
            `
            user_id:id,
            total_mcqs:mcqs_solved_total,
            total_correct:mcqs_solved_correct,
            xp:xp,
            rank:rank
            `,
          )
          .eq('id', userId)
          .maybeSingle()

        if (error) throw error
        if (!mounted) return

        setStats(
          data ?? {
            user_id: userId,
            total_mcqs: 0,
            total_correct: 0,
            xp: 0,
            rank: null,
          },
        )
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
