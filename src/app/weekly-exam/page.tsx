'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeOff, KeyRound, Trophy, UserRound } from 'lucide-react'

export default function WeeklyExamAccess() {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function verify() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/weekly-exam/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name, anonymous }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) {
        setError(json?.error || 'Invalid code')
        return
      }
      router.replace('/weekly-exam/exam')
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-primary">
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Mock exam
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Mock Exam Access
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Enter your name and exam code to start. You can appear on the
          leaderboard anonymously while still keeping your score ranked.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Enter exam</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Code unlocks this device for the active mock paper.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium" htmlFor="name">
              Name
              <div className="mt-2 flex items-center gap-2 rounded-md border bg-background px-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                <input
                  id="name"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className="block text-sm font-medium" htmlFor="code">
              Exam code
              <div className="mt-2 flex items-center gap-2 rounded-md border bg-background px-3">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <input
                  id="code"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm uppercase outline-none"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code"
                  autoComplete="one-time-code"
                />
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-lg border bg-background p-3 text-sm">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="flex items-center gap-2 font-medium">
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                  Show me as Anonymous
                </span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                  Your marks and rank will be visible, but your name will be
                  hidden on the leaderboard.
                </span>
              </span>
            </label>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={verify}
              disabled={loading || !code.trim() || (!anonymous && !name.trim())}
              className="vibrant-btn w-full disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enter Exam'}
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Trophy className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            View Rankings
          </h2>
          <Link
            href="/mock-exam/rankings"
            className="vibrant-btn mt-6 inline-flex"
          >
            Open Rankings
          </Link>
          <Link
            href="/mock-exam/free-daily-mcqs"
            className="mt-3 inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-semibold hover:bg-muted"
          >
            Free Daily MCQs
          </Link>
        </section>
      </div>
    </main>
  )
}
