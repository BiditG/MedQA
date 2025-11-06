'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WeeklyExamAccess() {
  const [code, setCode] = useState('')
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
        body: JSON.stringify({ code }),
      })
      const json = await res.json()
      if (!res.ok || !json?.ok) {
        setError(json?.error || 'Invalid code')
        return
      }
      // Cookie is set by the API; no localStorage needed.
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
          autoComplete="one-time-code"
        />
        {error && (
          <div className="mt-2 text-left text-sm text-red-600">{error}</div>
        )}
        <button
          onClick={verify}
          disabled={loading || !code.trim()}
          className="mt-4 w-full rounded bg-primary px-3 py-2 text-white disabled:opacity-50"
        >
          {loading ? 'Verifying…' : 'Enter Exam'}
        </button>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        No account required. Code unlocks this device only.
      </div>
    </main>
  )
}
