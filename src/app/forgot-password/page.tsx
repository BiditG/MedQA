'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/utils/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const supabase = createBrowserClient()
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const callbackUrl = `${origin}/reset-password`
      // v2 API: reset password for email sends email with link
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl,
      })
      if (error) setMessage(error.message)
      else setMessage('If that email exists, a reset link has been sent.')
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
        <h1 className="text-xl font-semibold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your account email to receive a reset link.
        </p>
        <input
          type="email"
          className="w-full rounded-md border px-3 py-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-700 px-4 py-2 text-white"
        >
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        {message && (
          <div className="text-sm text-muted-foreground">{message}</div>
        )}
      </form>
    </div>
  )
}
