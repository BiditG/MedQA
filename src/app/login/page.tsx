'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInAndPersist } from '@/utils/auth-client'

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(
    search?.get('message') ?? null,
  )

  // redirectTo param
  const redirectTo = search?.get('redirectTo') || '/'

  const onSignIn: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
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
            <h1 className="text-lg font-semibold">Sign in</h1>
            <Link href="/" className="text-sm text-muted-foreground">
              Back
            </Link>
          </div>

          <div className="rounded-b-md border bg-white p-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold">Sign in</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Use your email and password to sign in.
              </p>

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
