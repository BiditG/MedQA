'use client'
import { ChangeEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import useUser from '@/hooks/useUser'

function adminFetch(url: string, init: RequestInit = {}) {
  const token =
    typeof window === 'undefined' ? null : localStorage.getItem('token')
  return fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
}
function previewCsv(csv: string) {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  const subjects: Record<string, number> = {}
  lines.slice(1).forEach((line) => {
    const match = line.match(/^"[^"]*","([^"]*)"/)
    if (match) subjects[match[1]] = (subjects[match[1]] || 0) + 1
  })
  return { count: Math.max(0, lines.length - 1), subjects }
}

export default function RankbreakerAdminPage() {
  const { user, loading } = useUser()
  const [editions, setEditions] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [detail, setDetail] = useState<any>(null),
    [name, setName] = useState('CEE Rankbreaker 01'),
    [csv, setCsv] = useState(''),
    [preview, setPreview] = useState<any>(null),
    [message, setMessage] = useState(''),
    [codes, setCodes] = useState<any[]>([]),
    [attempts, setAttempts] = useState<any[]>([]),
    [lastCode, setLastCode] = useState(''),
    [codeLabel, setCodeLabel] = useState(''),
    [codeLimit, setCodeLimit] = useState(''),
    [codeExpiry, setCodeExpiry] = useState('')
  const loadEditions = async () => {
    const response = await adminFetch('/api/admin/cee-rankbreaker/editions')
    const json = await response.json()
    if (response.ok) setEditions(json.editions || [])
    else setMessage(json.error)
  }
  const loadSelected = async (id: string) => {
    setSelected(id)
    const [editionResponse, codesResponse, attemptsResponse] =
      await Promise.all([
        adminFetch(`/api/admin/cee-rankbreaker/editions/${id}`),
        adminFetch(`/api/admin/cee-rankbreaker/editions/${id}/codes`),
        adminFetch(`/api/admin/cee-rankbreaker/editions/${id}/attempts`),
      ])
    const editionJson = await editionResponse.json(),
      codesJson = await codesResponse.json(),
      attemptsJson = await attemptsResponse.json()
    if (editionResponse.ok) setDetail(editionJson)
    setCodes(codesJson.codes || [])
    setAttempts(attemptsJson.attempts || [])
  }
  useEffect(() => {
    if (user?.role === 'admin') loadEditions()
  }, [user?.role])
  async function createEdition() {
    const response = await adminFetch('/api/admin/cee-rankbreaker/editions', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
    const json = await response.json()
    if (!response.ok) return setMessage(json.error)
    await loadEditions()
    loadSelected(json.edition.id)
  }
  async function upload() {
    if (!selected || !csv) return
    if (
      !confirm(
        `Replace this draft with ${
          preview?.count || 0
        } questions? This cannot be undone.`,
      )
    )
      return
    const response = await adminFetch(
      `/api/admin/cee-rankbreaker/editions/${selected}/import`,
      { method: 'POST', body: JSON.stringify({ csv }) },
    )
    const json = await response.json()
    if (!response.ok) return setMessage(json.errors?.join(' ') || json.error)
    setMessage(`Imported ${json.count} questions.`)
    loadSelected(selected)
    loadEditions()
  }
  async function updateEdition(patch: any) {
    const response = await adminFetch(
      `/api/admin/cee-rankbreaker/editions/${selected}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
    )
    const json = await response.json()
    if (!response.ok) return setMessage(json.error)
    setMessage('Edition updated.')
    loadSelected(selected)
    loadEditions()
  }
  async function createCode() {
    if (detail?.edition?.status !== 'published') {
      return setMessage(
        'Publish the 200-question edition before creating an access code.',
      )
    }
    const response = await adminFetch(
      `/api/admin/cee-rankbreaker/editions/${selected}/codes`,
      {
        method: 'POST',
        body: JSON.stringify({
          label: codeLabel,
          maxUses: codeLimit,
          expiresAt: codeExpiry,
        }),
      },
    )
    const json = await response.json()
    if (!response.ok) return setMessage(json.error)
    setLastCode(json.plaintextCode)
    setCodes([json.code, ...codes])
    setCodeLabel('')
    setCodeLimit('')
    setCodeExpiry('')
  }
  async function resetAttempt(id: string) {
    if (
      !confirm('Reset this attempt and allow this registration to start again?')
    )
      return
    const response = await adminFetch(
      `/api/admin/cee-rankbreaker/attempts/${id}/reset`,
      { method: 'POST', body: JSON.stringify({ confirm: true }) },
    )
    const json = await response.json()
    if (!response.ok) return setMessage(json.error)
    loadSelected(selected)
  }
  if (loading) return <main className="p-6">Checking session…</main>
  if (!user || user.role !== 'admin')
    return <main className="p-6">Admin access required.</main>
  return (
    <main className="mx-auto max-w-7xl p-6">
      <Link href="/admin" className="text-sm text-muted-foreground">
        ← Admin
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">CEE Rankbreaker admin</h1>
      {message && <p className="mt-3 rounded border p-3 text-sm">{message}</p>}
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border bg-card p-4">
          <h2 className="font-semibold">Editions</h2>
          <div className="mt-3 space-y-2">
            {editions.map((edition) => (
              <button
                key={edition.id}
                onClick={() => loadSelected(edition.id)}
                className={`w-full rounded border p-3 text-left text-sm ${
                  selected === edition.id ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <strong>{edition.name}</strong>
                <br />
                <span className="text-muted-foreground">
                  {edition.status} ·{' '}
                  {edition.cee_rankbreaker_questions?.[0]?.count || 0}/200
                  questions
                </span>
              </button>
            ))}
          </div>
          <div className="mt-5 border-t pt-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border p-2 text-sm"
            />
            <button onClick={createEdition} className="vibrant-btn mt-2 w-full">
              Create draft
            </button>
          </div>
        </aside>
        {selected && (
          <section className="space-y-6">
            <section className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">
                    {detail?.edition?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Status: {detail?.edition?.status} ·{' '}
                    {detail?.questions?.length || 0}/200 valid questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateEdition({ status: 'published' })}
                    className="vibrant-btn"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => updateEdition({ status: 'closed' })}
                    className="rounded border px-3 py-2 text-sm"
                  >
                    Close entry
                  </button>
                  <label className="flex items-center gap-2 rounded border px-3 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(detail?.edition?.review_released)}
                      onChange={(e) =>
                        updateEdition({ reviewReleased: e.target.checked })
                      }
                    />
                    Release review
                  </label>
                </div>
              </div>
              <a
                className="mt-4 inline-block text-sm text-primary underline"
                href="/cee-rankbreaker-questions-template.csv"
                download
              >
                Download CSV template
              </a>
              <span className="mx-3 text-sm text-muted-foreground">
                Examples:{' '}
                <a
                  className="underline"
                  href="/cee-rankbreaker-questions-example.csv"
                  download
                >
                  sample CSV
                </a>
              </span>
              <input
                className="mt-4 block w-full text-sm"
                type="file"
                accept=".csv,text/csv"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const file = event.target.files?.[0]
                  if (file)
                    file.text().then((text) => {
                      setCsv(text)
                      setPreview(previewCsv(text))
                    })
                }}
              />
              {preview && (
                <div className="mt-3 rounded border bg-muted/30 p-3 text-sm">
                  Preview: {preview.count} parsed rows. Subject counts:{' '}
                  {Object.entries(preview.subjects)
                    .map(([subject, count]) => `${subject}: ${count}`)
                    .join(' · ') || 'none'}
                  .
                </div>
              )}
              <button
                onClick={upload}
                disabled={!csv || detail?.edition?.status !== 'draft'}
                className="mt-3 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                Confirm and import draft
              </button>
            </section>
            <section className="rounded-xl border bg-card p-5">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">Access codes</h2>
                <button
                  onClick={createCode}
                  disabled={detail?.edition?.status !== 'published'}
                  className="vibrant-btn disabled:opacity-50"
                >
                  Create code
                </button>
              </div>
              {detail?.edition?.status !== 'published' && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Publish this 200-question edition before creating access
                  codes.
                </p>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <input
                  value={codeLabel}
                  onChange={(e) => setCodeLabel(e.target.value)}
                  className="rounded border p-2 text-sm"
                  placeholder="Label (optional)"
                />
                <input
                  value={codeLimit}
                  onChange={(e) => setCodeLimit(e.target.value)}
                  className="rounded border p-2 text-sm"
                  type="number"
                  min="1"
                  placeholder="Use limit (optional)"
                />
                <input
                  value={codeExpiry}
                  onChange={(e) => setCodeExpiry(e.target.value)}
                  className="rounded border p-2 text-sm"
                  type="datetime-local"
                />
              </div>
              {lastCode && (
                <p className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm">
                  New access code: <code>{lastCode}</code>. It remains visible
                  in this admin-only table.
                </p>
              )}
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Code</th>
                      <th className="text-left">Label</th>
                      <th className="text-left">Uses</th>
                      <th className="text-left">Expires</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code) => (
                      <tr key={code.id} className="border-t">
                        <td className="py-2 font-mono">
                          {code.code_value || 'Regenerate required'}
                        </td>
                        <td className="py-2">{code.label || '—'}</td>
                        <td>
                          {code.use_count}/{code.max_uses || '∞'}
                        </td>
                        <td>
                          {code.expires_at
                            ? new Date(code.expires_at).toLocaleString()
                            : 'Never'}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              adminFetch(
                                `/api/admin/cee-rankbreaker/codes/${code.id}`,
                                {
                                  method: 'PATCH',
                                  body: JSON.stringify({
                                    active: !code.active,
                                  }),
                                },
                              ).then(() => loadSelected(selected))
                            }
                            className="rounded border px-2 py-1"
                          >
                            {code.active ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-xl font-semibold">
                Registrations and attempts
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                WhatsApp numbers are displayed only in this authorized admin
                view.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Name</th>
                      <th className="text-left">WhatsApp</th>
                      <th className="text-left">Status</th>
                      <th className="text-left">Result</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr className="border-t" key={attempt.id}>
                        <td className="py-2">{attempt.participant_name}</td>
                        <td>{attempt.whatsapp_normalized}</td>
                        <td>{attempt.status}</td>
                        <td>
                          {Number(attempt.net_marks).toFixed(2)} ·{' '}
                          {Number(attempt.accuracy).toFixed(2)}%
                        </td>
                        <td>
                          <button
                            onClick={() => resetAttempt(attempt.id)}
                            className="rounded border px-2 py-1"
                          >
                            Reset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="rounded-xl border bg-card p-5">
              <h2 className="text-xl font-semibold">Question preview</h2>
              <div className="mt-3 max-h-80 space-y-3 overflow-auto">
                {detail?.questions?.map((question: any) => (
                  <article
                    key={question.id}
                    className="rounded border p-3 text-sm"
                  >
                    <strong>
                      {question.position}. {question.subject}
                    </strong>
                    <p className="mt-1">{question.question}</p>
                  </article>
                ))}
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  )
}
