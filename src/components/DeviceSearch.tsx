'use client'

import React, { useState, useEffect, useRef } from 'react'

type DeviceRecord = any

function formatDate(str?: string) {
  if (!str) return ''
  try {
    const d = new Date(str)
    return d.toLocaleDateString()
  } catch {
    return str
  }
}

export default function DeviceSearch() {
  const [q, setQ] = useState('')
  const [type, setType] = useState<
    'classification' | 'enforcement' | '510k' | 'pma' | 'registrationlisting'
  >('classification')
  const [limit, setLimit] = useState(10)
  const [results, setResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)

  async function search(e?: React.FormEvent) {
    e?.preventDefault()
    if (!q.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const params = new URLSearchParams()
      params.set('q', q)
      params.set('type', type)
      params.set('limit', String(limit))

      const res = await fetch(`/api/devices?${params.toString()}`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const json = await res.json()
      setResults(json)
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  // click outside to clear results
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return
      if (!(e.target instanceof Node)) return
      if (!containerRef.current.contains(e.target)) {
        setResults(null)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  return (
    <div ref={containerRef} className="mx-auto max-w-4xl p-4">
      <div className="rounded-2xl border bg-background p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Device Lookup</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search OpenFDA device datasets and recalls. Use the structured
              fields for common searches.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Dataset: {type} • limit: {limit}
          </div>
        </div>

        <form onSubmit={search} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            aria-label="device-name"
            placeholder="Device name (e.g. pacemaker)"
            className="col-span-2 rounded border px-3 py-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="rounded border px-2 py-2"
          >
            <option value="classification">classification</option>
            <option value="enforcement">enforcement (recalls)</option>
            <option value="510k">510k</option>
            <option value="pma">pma</option>
            <option value="registrationlisting">registrationlisting</option>
          </select>

          <div className="flex items-center gap-2 sm:col-span-3">
            <label className="text-sm text-muted-foreground">Limit</label>
            <input
              type="number"
              className="w-20 rounded border px-2 py-1"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value || 10))}
            />
            <button
              type="submit"
              className="ml-auto rounded bg-blue-600 px-4 py-2 text-white"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setQ('')
                setResults(null)
                setError(null)
              }}
              className="text-sm text-muted-foreground"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="mt-4">
          {loading && <div className="animate-pulse">Loading results…</div>}
          {error && <div className="text-red-600">{error}</div>}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing OpenFDA response
                </div>
                <div className="text-sm text-muted-foreground">
                  Total:{' '}
                  {results.meta?.results?.total ||
                    (Array.isArray(results.results)
                      ? results.results.length
                      : 0)}
                </div>
              </div>

              <details className="rounded bg-gray-50 p-3">
                <summary className="cursor-pointer text-sm font-medium">
                  Raw response (click to expand)
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded bg-gray-100 p-3">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>

              <div className="mt-2 space-y-3">
                {results.results &&
                Array.isArray(results.results) &&
                results.results.length > 0 ? (
                  results.results.map((r: DeviceRecord, i: number) => {
                    if (r.device_class || r.device_name)
                      return <ClassificationCard key={i} record={r} />
                    if (r.k_number || r.clearance_date || r.submission_number)
                      return <K510Card key={i} record={r} />
                    if (r.pma_number || r.approval_date)
                      return <PmaCard key={i} record={r} />
                    if (r.recalling_firm || r.recall_initiation_date)
                      return <EnforcementCard key={i} record={r} />
                    return <DeviceCard key={i} record={r} />
                  })
                ) : (
                  <div className="text-sm text-gray-600">No records found.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DeviceCard({ record }: { record: any }) {
  // try to normalise fields across endpoints
  const deviceName =
    record.device_name ||
    record.device ||
    record.openfda?.device_name ||
    record.product_code ||
    ''
  const manufacturer =
    record.manufacturer_name ||
    record.openfda?.manufacturer_name ||
    record.manufacturer ||
    ''
  const productCode = record.product_code || record.openfda?.product_code || ''
  const deviceClass =
    record.device_class ||
    record.openfda?.device_class ||
    record.classification ||
    ''
  const regulatory = record.regulation_number || record.premarket_approval || ''

  // Heuristic regulatory status (depends on dataset)
  const regulatoryStatus =
    record.decision ||
    record.status ||
    record.submission_status ||
    record.clearance_date ||
    record.approval_date ||
    record.approval_status ||
    record.regulatory_status ||
    record.openfda?.regulatory_status ||
    ''

  const recallStatus =
    record.recalling_firm ||
    record.recall_initiation_date ||
    record.recall_number ||
    record.openfda?.recall_status
      ? 'Recalled'
      : 'No known recalls'

  const [recalls, setRecalls] = React.useState<any[] | null>(null)
  const [recallsLoading, setRecallsLoading] = React.useState(false)
  const [recallsError, setRecallsError] = React.useState<string | null>(null)

  async function fetchRecalls() {
    // prefer product code; fallback to device name
    const key = productCode || deviceName
    if (!key) {
      setRecallsError(
        'No product code or device name available to lookup recalls',
      )
      return
    }
    setRecallsLoading(true)
    setRecallsError(null)
    setRecalls(null)
    try {
      const q = productCode
        ? `product_code:${productCode}`
        : `device_name:\"${deviceName}\"`
      const params = new URLSearchParams({
        q,
        type: 'enforcement',
        limit: '50',
      })
      const res = await fetch(`/api/devices?${params.toString()}`)
      if (!res.ok) throw new Error(`server returned ${res.status}`)
      const json = await res.json()
      setRecalls(Array.isArray(json.results) ? json.results : [])
    } catch (err: any) {
      setRecallsError(err.message || String(err))
    } finally {
      setRecallsLoading(false)
    }
  }

  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">{deviceName || 'Unnamed device'}</h3>
      <div className="text-sm text-gray-700">
        Manufacturer: {manufacturer || '—'}
      </div>
      <div className="text-sm text-gray-700">
        Product code: {productCode || '—'}
      </div>
      <div className="text-sm text-gray-700">
        Device class: {deviceClass || '—'}
      </div>
      <div className="text-sm text-gray-700">
        Regulatory note: {regulatory || '—'}
      </div>
      <div className="text-sm text-gray-700">
        Regulatory status: {regulatoryStatus || 'Unknown'}
      </div>
      <div className="text-sm text-gray-700">Recall status: {recallStatus}</div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={fetchRecalls}
          className="rounded bg-red-600 px-2 py-1 text-sm text-white"
          aria-pressed={!!recalls}
        >
          Show recalls
        </button>
      </div>

      {recallsLoading && (
        <div className="mt-2 text-sm text-gray-600">Loading recalls…</div>
      )}
      {recallsError && (
        <div className="mt-2 text-sm text-red-600">{recallsError}</div>
      )}

      {recalls && recalls.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="font-medium text-red-700">
            Recalls ({recalls.length})
          </div>
          {recalls.map((rc: any, idx: number) => (
            <div key={idx} className="rounded bg-yellow-50 p-2">
              <div className="text-sm font-semibold">
                {rc.recalling_firm || rc.firm_name || 'Unknown'}
              </div>
              <div className="text-sm">
                Reason: {rc.reason_for_recall || rc.reason || '—'}
              </div>
              <div className="text-sm">
                Affected devices:{' '}
                {rc.product_description ||
                  rc.affected_devices ||
                  rc.product_type ||
                  '—'}
              </div>
              <div className="text-sm">
                Initiation date: {formatDate(rc.recall_initiation_date)}
              </div>
            </div>
          ))}
        </div>
      )}

      {recalls && recalls.length === 0 && (
        <div className="mt-2 text-sm text-gray-600">
          No recalls found for this device.
        </div>
      )}
    </div>
  )
}

function ClassificationCard({ record }: { record: any }) {
  const name =
    record.device_name ||
    record.openfda?.device_name ||
    record.marketing_name ||
    ''
  const cls = record.device_class || record.openfda?.device_class || ''
  const regulation =
    record.regulation_number || record.openfda?.regulation_number || ''
  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">{name || 'Classification record'}</h3>
      <div className="text-sm">Class: {cls || '—'}</div>
      <div className="text-sm">Regulation: {regulation || '—'}</div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: classification dataset
      </div>
    </div>
  )
}

function K510Card({ record }: { record: any }) {
  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">
        {record.device_name || record.trade_name || '510(k) record'}
      </h3>
      <div className="text-sm">
        Applicant: {record.applicant || record.manufacturer_name || '—'}
      </div>
      <div className="text-sm">
        K number: {record.k_number || record.submission_number || '—'}
      </div>
      <div className="text-sm">
        Decision: {record.decision || record.clearance_date || '—'}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: 510(k) dataset
      </div>
    </div>
  )
}

function PmaCard({ record }: { record: any }) {
  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">
        {record.device_name || record.trade_name || 'PMA record'}
      </h3>
      <div className="text-sm">PMA number: {record.pma_number || '—'}</div>
      <div className="text-sm">
        Approval date: {record.approval_date || record.approval || '—'}
      </div>
      <div className="text-sm">
        Applicant: {record.applicant || record.manufacturer_name || '—'}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: PMA dataset
      </div>
    </div>
  )
}

function EnforcementCard({ record }: { record: any }) {
  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">
        Recall:{' '}
        {record.product_description ||
          record.product_type ||
          'Enforcement record'}
      </h3>
      <div className="text-sm">
        Firm: {record.recalling_firm || record.firm_name || '—'}
      </div>
      <div className="text-sm">
        Reason: {record.reason_for_recall || record.reason || '—'}
      </div>
      <div className="text-sm">
        Initiation: {formatDate(record.recall_initiation_date)}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: enforcement (recalls)
      </div>
    </div>
  )
}
