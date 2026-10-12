'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CeeRankbreakerAccess() {
  const [fullName, setFullName] = useState('')
  const [whatsApp, setWhatsApp] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [acceptedRules, setAcceptedRules] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/cee-rankbreaker/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, whatsApp, accessCode, acceptedRules }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Registration failed.')
      router.push('/cee-rankbreaker/exam')
    } catch (err: any) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <section id="enter" className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Enter CEE Rankbreaker</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One ranked attempt per edition. Your name and exam statistics will
        appear on the CEE Rankbreaker ranking.
      </p>
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-medium">
          Full name
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3"
          />
        </label>
        <label className="block text-sm font-medium">
          WhatsApp number
          <input
            value={whatsApp}
            onChange={(e) => setWhatsApp(e.target.value)}
            inputMode="tel"
            autoComplete="tel"
            placeholder="+977 98…"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3"
          />
        </label>
        <label className="block text-sm font-medium">
          Exam access code
          <input
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            autoComplete="one-time-code"
            className="mt-2 h-11 w-full rounded-md border bg-background px-3 uppercase"
          />
        </label>
        <label className="flex gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <input
            className="mt-1"
            type="checkbox"
            checked={acceptedRules}
            onChange={(e) => setAcceptedRules(e.target.checked)}
          />
          <span>
            I acknowledge the exam rules and consent to MEDQAS storing my
            registration details. My WhatsApp number will remain private.
          </span>
        </label>
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={submit}
          disabled={
            loading ||
            !fullName.trim() ||
            !whatsApp.trim() ||
            !accessCode.trim() ||
            !acceptedRules
          }
          className="vibrant-btn w-full disabled:opacity-50"
        >
          {loading ? 'Checking access…' : 'Continue to rules'}
        </button>
      </div>
    </section>
  )
}
