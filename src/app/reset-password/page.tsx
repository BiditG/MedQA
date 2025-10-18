'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/utils/supabase-browser'

export default function ResetPasswordPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // On arriving from email link, Supabase will include access_token in URL hash for PKCE or query for OTP.
    // The auth helpers middleware should maintain session, but to be safe, we call getSession which will
    // exchange code if present.
    const init = async () => {
      const supabase = createBrowserClient()
      try {
        await supabase.auth.getSession()
      } catch {}
      setReady(true)
    }
    init()
  }, [params])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createBrowserClient()
      // @ts-ignore supabase-js v2
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setMessage(error.message)
      else {
        setMessage('Password updated. You can now sign in.')
        setTimeout(() => router.push('/login?message=Password%20updated'), 1000)
      }
    } catch (err: any) {
      setMessage(err?.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-3 rounded-lg bg-card p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Reset password</h1>
        {!ready ? (
          <div>Preparing…</div>
        ) : (
          <>
            <input
              type="password"
              className="w-full rounded-md border px-3 py-2"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-green-700 px-4 py-2 text-white"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
            {message && (
              <div className="text-sm text-muted-foreground">{message}</div>
            )}
          </>
        )}
      </form>
    </div>
  )
}
