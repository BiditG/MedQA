'use client'

import { useState } from 'react'

export default function WeeklyExamConfig() {
  const [code, setCode] = useState('')
  const [expiresAt, setExpiresAt] = useState<string>('')
  const [active, setActive] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/weekly-exam/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, expiresAt: expiresAt || null, active }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMessage(json?.error || 'Failed to save code')
      } else {
        setMessage('Weekly exam code created')
        setCode('')
        setExpiresAt('')
        setActive(true)
      }
    } catch (e: any) {
      setMessage(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-md border bg-card p-4">
      <h2 className="text-lg font-semibold">Weekly Exam</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create access codes that unlock the Weekly Exam for guests.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs">Access code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter new access code"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="text-xs">Expires at (optional)</label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <label className="mr-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Active
          </label>
          <button
            onClick={save}
            disabled={loading || !code}
            className="ml-auto w-full rounded-md bg-primary px-4 py-2 text-white disabled:opacity-50 sm:w-auto"
          >
            {loading ? 'Saving…' : 'Create Code'}
          </button>
        </div>
      </div>
      {message && <div className="mt-2 text-sm">{message}</div>}
      <div className="mt-2 text-xs text-muted-foreground">
        Uses table <code>weekly_codes</code> (id uuid pk, code text unique,
        active bool, expires_at timestamptz). If not present, the API falls back
        to <code>app_settings</code> or <code>WEEKLY_EXAM_CODE</code> for local
        dev.
      </div>
    </div>
  )
}
