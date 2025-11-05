'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SupaGoogleSignIn from '@/components/SupaGoogleSignIn'
import SupaFacebookSignIn from '@/components/SupaFacebookSignIn'
import { signInAndPersist } from '@/utils/auth-client'

// helper removed: we now persist sessions via signInAndPersist which posts tokens to server

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(
    search?.get('message') ?? null,
  )
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  // Add this line to get redirectTo
  const redirectTo = search?.get('redirectTo') || '/'

  const onSignIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    setMessage(null)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    try {
      await signInAndPersist(email, password)
      try {
        router.refresh()
      } catch {}
      router.push(redirectTo)
    } catch (err: any) {
      setMessage(err?.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const onSignUp: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    const resp = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const res = await resp
      .json()
      .catch(() => ({ error: 'Unexpected server response' }))
    setLoading(false)
    if (res?.error) {
      setMessage(res.error || 'Failed to sign up')
      return
    }
    setMessage('Sign-up complete. Check email if you used magic link.')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-sm">
          {/* Close button */}
          <button
            onClick={() => router.push('/')}
            aria-label="Close sign in"
            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-primary/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setMode('signin')}
                className={`rounded-t-md px-3 py-2 ${
                  mode === 'signin'
                    ? 'bg-white text-black'
                    : 'text-muted-foreground'
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`rounded-t-md px-3 py-2 ${
                  mode === 'signup'
                    ? 'bg-white text-black'
                    : 'text-muted-foreground'
                }`}
              >
                Create account
              </button>
            </div>
            <Link href="/" className="text-sm text-muted-foreground">
              Back
            </Link>
          </div>

          <div className="rounded-b-md border bg-white p-4">
            {mode === 'signin' ? (
              <div>
                <h2 className="mb-2 text-lg font-semibold">Sign in</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Use your email and password to sign in.
                </p>

                {/* Social sign-in buttons - pass redirectTo */}
                <div className="mb-4 space-y-2">
                  <SupaGoogleSignIn redirectTo={redirectTo} />
                  <SupaFacebookSignIn redirectTo={redirectTo} />
                </div>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={onSignIn}>
                  <label className="text-sm" htmlFor="signin-email">
                    Email
                  </label>
                  <input
                    id="signin-email"
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    name="email"
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                  />
                  <label className="text-sm" htmlFor="signin-password">
                    Password
                  </label>
                  <input
                    id="signin-password"
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    aria-required="true"
                  />
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="submit"
                      disabled={loading}
                      className="vibrant-btn w-full justify-center px-4 py-2 sm:w-auto"
                    >
                      {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                    <Link
                      href="/forgot-password"
                      className="text-center text-sm text-muted-foreground sm:text-right"
                    >
                      Forgot?
                    </Link>
                  </div>
                  {message && (
                    <p className="mt-2 rounded-md bg-foreground/5 p-2 text-sm text-foreground">
                      {message}
                    </p>
                  )}
                </form>
              </div>
            ) : (
              <div>
                {/* Sign up view */}
                <h2 className="mb-2 text-lg font-semibold">Create account</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Sign up to get started.
                </p>

                {/* Social sign-in for signup too - pass redirectTo */}
                <div className="mb-4 space-y-2">
                  <SupaGoogleSignIn redirectTo={redirectTo} />
                  <SupaFacebookSignIn redirectTo={redirectTo} />
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form className="space-y-3" onSubmit={onSignUp}>
                  <label className="text-sm" htmlFor="signup-email">
                    Email
                  </label>
                  <input
                    id="signup-email"
                    name="email"
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                  />
                  <label className="text-sm" htmlFor="signup-password">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Create a password"
                    required
                    aria-required="true"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md border border-foreground/20 px-4 py-2"
                  >
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                  {message && (
                    <p className="mt-2 rounded-md bg-foreground/5 p-2 text-sm text-foreground">
                      {message}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function Login() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
