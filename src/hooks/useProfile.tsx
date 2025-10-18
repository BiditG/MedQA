'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@/utils/supabase-browser'

export function useProfile() {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!mounted) return
        if (!res.ok) {
          // server returned an error (500) or unauthenticated
          const json = await res.json().catch(() => ({}))
          console.error('[useProfile] /api/auth/me error', json)
          return
        }
        const json = await res.json()
        if (mounted && json?.profile) setProfile(json.profile)
      } catch (err) {
        console.error('[useProfile] fetch /api/auth/me failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Fast path: use RLS via browser client to fetch own profile quickly for UI
    const fastMe = async () => {
      try {
        const supabase = createBrowserClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!mounted) return
        if (user?.id) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()
          if (!mounted) return
          if (data) setProfile((prev: any) => prev ?? data)
        }
      } catch (e) {
        // ignore
      }
    }

    // Kick off both in parallel
    fastMe()
    fetchMe()

    // also subscribe to auth changes using the browser client so UI responds immediately
    const supabase = createBrowserClient()
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          if (mounted) setProfile(null)
        } else if (session?.user?.id) {
          // fast update first, then confirm via server
          fastMe()
          fetchMe()
        }
      },
    )

    return () => {
      mounted = false
      try {
        listener?.subscription?.unsubscribe()
      } catch {}
    }
  }, [])

  return { profile, loading }
}
