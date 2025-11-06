'use client'

import { useEffect, useState } from 'react'

export function useProfile() {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchMe = async () => {
      try {
        const headers: any = { 'Content-Type': 'application/json' }
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token')
          if (token) headers['Authorization'] = `Bearer ${token}`
        }
        const res = await fetch('/api/auth/me', { headers })
        if (!mounted) return
        if (!res.ok) {
          // If unauthorized, just clear profile quietly; otherwise log for debugging
          if (res.status === 401) {
            setProfile(null)
            return
          }
          const json = await res.json().catch(() => ({}))
          console.debug('[useProfile] /api/auth/me error', json)
          setProfile(null)
          return
        }
        const json = await res.json()
        if (!mounted) return
        setProfile(json?.user || null)
      } catch (err) {
        console.debug('[useProfile] fetch /api/auth/me failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchMe()

    // listen for auth changes from our client shim
    function onAuth() {
      fetchMe()
    }
    window.addEventListener('auth:change', onAuth as EventListener)

    return () => {
      mounted = false
      window.removeEventListener('auth:change', onAuth as EventListener)
    }
  }, [])

  return { profile, loading }
}
