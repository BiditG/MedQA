'use client'

import { useEffect, useState, useCallback } from 'react'
import { signOut as clientSignOut } from '@/utils/auth-client'

export type User = {
  id: string
  name?: string
  email?: string
  role?: string
  created_at?: string
}

export default function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const headers: any = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      const resp = await fetch('/api/auth/me', { headers })
      if (!resp.ok) {
        setUser(null)
      } else {
        const data = await resp.json()
        setUser(data.user || null)
      }
    } catch (e) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    function onAuth() {
      load()
    }
    window.addEventListener('auth:change', onAuth as EventListener)
    return () =>
      window.removeEventListener('auth:change', onAuth as EventListener)
  }, [load])

  const logout = useCallback(() => {
    clientSignOut()
    setUser(null)
  }, [])

  return { user, loading, reload: load, logout }
}
