'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function WeeklyExamAccess() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Show a continue option instead of auto-redirecting to avoid skipping the code screen unexpectedly
    setHasAccess(localStorage.getItem('weekly_exam_access') === 'granted')
  }, [])

  async function verify() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/weekly-exam/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) {
        setError(json?.error || 'Invalid code')
        return
      }
      localStorage.setItem('weekly_exam_access', 'granted')
      router.replace('/weekly-exam/exam')
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center p-4 text-center">
      <h1 className="text-2xl font-semibold">Weekly Exam Access</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the access code provided by the administrator.
      </p>
      <div className="mt-6 w-full rounded-lg border bg-card p-4 shadow-sm">
        <label htmlFor="code" className="text-sm">
          Access code
        </label>
        <input
          id="code"
          className="mt-2 w-full rounded-md border px-3 py-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
        />
        <button
          onClick={verify}
          disabled={loading || !code}
          className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Enter Exam'}
        </button>
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        {hasAccess && (
          <div className="mt-4">
            <button
              onClick={() => router.replace('/weekly-exam/exam')}
              className="w-full rounded-md border px-4 py-2 text-sm hover:bg-accent/50"
            >
              Continue without code
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              You already unlocked this device. If you want to use a new code,
              just enter it above.
            </p>
          </div>
        )}
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        No account required. Code unlocks this device only.
      </div>
    </main>
  )
}
