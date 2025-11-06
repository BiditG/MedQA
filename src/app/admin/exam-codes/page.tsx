'use client'

import React, { useEffect, useState } from 'react'
import useUser from '@/hooks/useUser'

type ExamCode = {
  id: string
  code: string
  label?: string
  active: boolean
  createdAt: string
  expiresAt?: string
}

export default function AdminExamCodes() {
  const { user, loading } = useUser()
  const [codes, setCodes] = useState<ExamCode[]>([])
  const [fetching, setFetching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const [form, setForm] = useState<{ label: string; expiresAt: string }>({
    label: '',
    expiresAt: '',
  })
  const [lastCreated, setLastCreated] = useState<ExamCode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExamCode | null>(null)

  async function load() {
    setFetching(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/exam-codes')
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'Failed to load')
      setCodes(data.codes || [])
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    load()
  }, [user])

  async function createCode(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLastCreated(null)
    try {
      const body: any = {}
      if (form.label) body.label = form.label
      if (form.expiresAt) body.expiresAt = form.expiresAt
      const resp = await fetch('/api/exam-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Create failed')
      setLastCreated(data.code)
      setForm({ label: '', expiresAt: '' })
      load()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setMessage(null)
    try {
      const resp = await fetch(`/api/exam-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Update failed')
      load()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  async function updateExpiry(id: string, expiresAt: string) {
    setMessage(null)
    try {
      const resp = await fetch(`/api/exam-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresAt }),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Update failed')
      load()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  async function updateLabel(id: string, label: string) {
    setMessage(null)
    try {
      const resp = await fetch(`/api/exam-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      const data = await resp.json()
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Update failed')
      load()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    }
  }

  async function remove(id: string) {
    // custom modal handles confirmation; this just deletes
    try {
      const resp = await fetch(`/api/exam-codes/${id}`, { method: 'DELETE' })
      const data = await resp.json().catch(() => ({}))
      if (!resp.ok || !data?.ok) throw new Error(data?.error || 'Delete failed')
      setMessage('Code deleted')
      load()
    } catch (e: any) {
      setMessage(e?.message || 'Error')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) return <div>Loading…</div>
  if (!user) return <div>Please sign in as admin to manage codes.</div>
  if (user.role !== 'admin') return <div>Access denied — admin only.</div>

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold">Admin — Exam Codes</h1>

      <form
        onSubmit={createCode}
        className="mb-6 space-y-2 rounded-md border bg-card p-4"
      >
        <h2 className="text-lg font-medium">Generate code</h2>
        <input
          className="w-full rounded-md border px-3 py-2"
          placeholder="Label (optional)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
        {/* Added label + placeholder for expiry date */}
        <label htmlFor="expiresAt" className="text-sm">
          Expiry date (optional)
        </label>
        <input
          id="expiresAt"
          className="w-full rounded-md border px-3 py-2"
          type="datetime-local"
          placeholder="Expiry date"
          aria-label="Expiry date"
          title="Expiry date"
          value={form.expiresAt}
          onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <button className="vibrant-btn" type="submit">
            Create
          </button>
          {lastCreated && (
            <span className="text-sm">
              New code:{' '}
              <code className="rounded bg-muted px-1 py-0.5">
                {lastCreated.code}
              </code>
            </span>
          )}
        </div>
        {message && (
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        )}
      </form>

      <div className="rounded-md border bg-card p-4">
        <h2 className="text-lg font-medium">Codes</h2>
        {fetching ? (
          <div>Loading…</div>
        ) : (
          <div className="mt-2 max-h-[60vh] overflow-auto text-sm">
            <table className="w-full table-auto text-left">
              <thead>
                <tr>
                  <th className="py-1">Code</th>
                  <th className="py-1">Label</th>
                  <th className="py-1">Active</th>
                  <th className="py-1">Created</th>
                  <th className="py-1">Expires</th>
                  <th className="py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} className="border-t align-top">
                    <td className="py-2">
                      <code className="rounded bg-muted px-1 py-0.5">
                        {c.code}
                      </code>
                    </td>
                    <td className="py-2">
                      <input
                        className="w-full rounded-md border px-2 py-1"
                        value={c.label || ''}
                        onChange={(e) => updateLabel(c.id, e.target.value)}
                        onBlur={(e) => updateLabel(c.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={c.active}
                          onChange={(e) => toggleActive(c.id, e.target.checked)}
                        />
                        <span className="text-xs">
                          {c.active ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </td>
                    <td className="py-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2">
                      <input
                        className="w-full rounded-md border px-2 py-1"
                        type="datetime-local"
                        placeholder="Expiry date"
                        aria-label="Expiry date"
                        title="Expiry date"
                        value={
                          c.expiresAt
                            ? new Date(c.expiresAt).toISOString().slice(0, 16)
                            : ''
                        }
                        onChange={(e) => updateExpiry(c.id, e.target.value)}
                        onBlur={(e) => updateExpiry(c.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => navigator.clipboard.writeText(c.code)}
                          type="button"
                        >
                          Copy
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => toggleActive(c.id, !c.active)}
                          type="button"
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="btn-ghost text-red-600"
                          onClick={() => setDeleteTarget(c)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-muted-foreground"
                    >
                      No codes yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-md bg-white p-4 shadow-lg dark:bg-neutral-900"
          >
            <h3 className="text-lg font-medium">Delete code?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This action cannot be undone.
              <br />
              Code:{' '}
              <code className="rounded bg-muted px-1 py-0.5">
                {deleteTarget.code}
              </code>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn-ghost"
                onClick={() => setDeleteTarget(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                onClick={() => remove(deleteTarget.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
