'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SupaGoogleSignIn from '@/components/SupaGoogleSignIn'
import SupaFacebookSignIn from '@/components/SupaFacebookSignIn'

async function postJson(url: string, body: any) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  try {
    return await res.json()
  } catch (err) {
    return { error: 'Unexpected server response' }
  }
}

export default function Login() {
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
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    const res = await postJson('/api/auth/signin', { email, password })
    setLoading(false)
    if (res?.error) {
      setMessage(res.error || 'Failed to sign in')
      return
    }
    try {
      router.refresh()
    } catch {}
    // Change this line to use redirectTo
    router.push(redirectTo)
  }

  const onSignUp: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    const res = await postJson('/api/auth/signup', { email, password })
    setLoading(false)
    if (res?.error) {
      setMessage(res.error || 'Failed to sign up')
      return
    }
    setMessage('Sign-up complete. Check email if you used magic link.')
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-sm">
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
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
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
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
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
                    className="w-full rounded-md bg-green-700 px-4 py-2 text-foreground sm:w-auto"
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
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
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
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
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
  )
}
