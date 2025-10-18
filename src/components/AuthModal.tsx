'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createBrowserClient } from '@/utils/supabase-browser'

export default function AuthModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [container] = useState(() =>
    typeof document !== 'undefined' ? document.createElement('div') : null,
  )

  useEffect(() => {
    if (!container) return
    document.body.appendChild(container)
    return () => {
      if (container.parentNode) container.parentNode.removeChild(container)
    }
  }, [container])

  if (!open || !container) return null

  async function signIn() {
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setMessage(error.message)
      else window.location.reload()
    } catch (err: any) {
      setMessage(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  async function signUp() {
    setLoading(true)
    setMessage(null)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm sign up')
    } catch (err: any) {
      setMessage(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-lg bg-card p-4 shadow-lg md:p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h2>
          <button className="text-sm text-muted-foreground" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin'
                ? 'Welcome back — sign in to continue.'
                : 'Create an account to save progress and access premium.'}
            </p>
            <div className="mt-4 space-y-3">
              <label className="text-sm" htmlFor="auth-email">
                Email
              </label>
              <input
                id="auth-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
              <label className="text-sm" htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="w-full rounded-md border px-3 py-2"
              />
              <div className="mt-3 flex w-full flex-col gap-2 md:flex-row md:items-center">
                {mode === 'signin' ? (
                  <button
                    onClick={signIn}
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-white md:w-auto"
                  >
                    {loading ? 'Signing in…' : 'Sign in'}
                  </button>
                ) : (
                  <button
                    onClick={signUp}
                    disabled={loading}
                    className="w-full rounded-md bg-primary px-4 py-2 text-white md:w-auto"
                  >
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                )}
                <button
                  className="text-sm text-muted-foreground md:ml-2"
                  onClick={() =>
                    setMode(mode === 'signin' ? 'signup' : 'signin')
                  }
                >
                  {mode === 'signin'
                    ? 'Create account'
                    : 'Already have an account?'}
                </button>
              </div>
              {message && (
                <div className="mt-2 text-sm text-red-600">{message}</div>
              )}
            </div>
          </div>
          <div className="md:border-l md:pl-6">
            <h3 className="font-medium">Why create an account?</h3>
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              <li>Save progress and track solved MCQs</li>
              <li>Access premium AI tools (if enabled)</li>
              <li>Sync across devices</li>
            </ul>
            <div className="mt-6">
              <button
                onClick={() => {
                  setMode('signin')
                }}
                className="w-full rounded-md border px-3 py-2"
              >
                Sign in
              </button>
              <div className="mt-3 text-sm text-muted-foreground">
                Google sign-in removed. Use email/password to sign up or sign
                in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, container)
}
