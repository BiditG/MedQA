'use client'

import { useState } from 'react'

export default function AdminPremiumToggle({
  id,
  initial,
}: {
  id: string
  initial: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState(initial)
  const [msg, setMsg] = useState<string | null>(null)

  async function toggle() {
    setLoading(true)
    setMsg(null)
    try {
      const res = await fetch('/api/admin/set-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, value: !value }),
      })
      const json = await res.json()
      if (!res.ok) {
        setMsg(json?.error || 'Update failed')
      } else {
        setValue(!value)
        setMsg(
          json?.ok
            ? json.premium
              ? 'Granted premium'
              : 'Revoked premium'
            : 'Updated',
        )
        // auto-dismiss
        setTimeout(() => setMsg(null), 2500)
      }
    } catch (e: any) {
      setMsg(String(e?.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className="rounded bg-blue-600 px-3 py-1 text-white"
      >
        {loading ? 'Saving552' : value ? 'Revoke premium' : 'Grant premium'}
      </button>
      {msg && <span className="text-sm text-green-600">{msg}</span>}
    </div>
  )
}
