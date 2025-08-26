'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// Using native <select> because the custom ui/select component is not present in the repo
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/tailwind'
import {
  Search,
  Database,
  AlertTriangle,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react'

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

const DATASETS = [
  { value: 'classification', label: 'Classification' },
  { value: 'enforcement', label: 'Recalls (Enforcement)' },
  { value: '510k', label: '510(k)' },
  { value: 'pma', label: 'PMA' },
  { value: 'registrationlisting', label: 'Registration' },
] as const

export default function DeviceSearch() {
  const [q, setQ] = useState('')
  const [type, setType] =
    useState<(typeof DATASETS)[number]['value']>('classification')
  const [limit, setLimit] = useState(10)
  const [results, setResults] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rawOpen, setRawOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

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

  // click outside to clear results dropdowns
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return
      if (!(e.target instanceof Node)) return
      if (!containerRef.current.contains(e.target)) {
        // no-op for now (kept for parity with your behavior)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const totalCount =
    results?.meta?.results?.total ??
    (Array.isArray(results?.results) ? results.results.length : 0)

  const hasRows = Array.isArray(results?.results) && results.results.length > 0

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-5xl p-4 md:p-6">
      {/* Hero header */}
      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-transparent to-primary/5 p-[1px]">
        <div className="rounded-2xl bg-background px-4 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                <Database className="h-3.5 w-3.5" /> OpenFDA Devices
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Device Lookup
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search device classifications, clearances, PMAs, registrations,
                and recalls.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-1 sm:text-right">
              <div className="rounded-lg border bg-muted/40 px-3 py-2">
                Dataset:{' '}
                <span className="font-medium">
                  {DATASETS.find((d) => d.value === type)?.label}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/40 px-3 py-2">
                Limit: <span className="font-medium">{limit}</span>
              </div>
            </div>
          </div>

          {/* Search form */}
          <form
            onSubmit={search}
            className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12"
          >
            <div className="relative md:col-span-6">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                aria-label="Device query"
                placeholder="e.g. pacemaker, stent, NPY, product_code:ABC"
                className="pl-10"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <label className="sr-only" htmlFor="dataset-select">
                Dataset
              </label>
              <select
                id="dataset-select"
                className="w-full rounded border bg-input p-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                {DATASETS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 md:col-span-3">
              <Input
                type="number"
                min={1}
                max={100}
                className="w-24 flex-shrink-0"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value || 10))}
                aria-label="Result limit"
              />
              <Button
                type="submit"
                className="w-full flex-shrink-0 md:w-auto"
                disabled={loading || !q.trim()}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        fill="currentColor"
                      />
                    </svg>
                    Searching…
                  </span>
                ) : (
                  'Search'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setQ('')
                  setResults(null)
                  setError(null)
                  inputRef.current?.focus()
                }}
                className="inline-flex w-full flex-shrink-0 justify-center md:w-auto md:justify-start"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Clear
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Feedback + results */}
      <div className="mt-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 space-y-4">
            <SkeletonRow />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard className="md:col-span-2" />
            </div>
          </div>
        )}

        {!loading && results && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5" /> OpenFDA response
              </div>
              <div className="text-sm text-muted-foreground">
                Total: <span className="font-medium">{totalCount}</span>
              </div>
            </div>

            {/* Raw payload toggle */}
            <div className="rounded-xl border bg-muted/30">
              <button
                type="button"
                onClick={() => setRawOpen((v) => !v)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
              >
                <span>Raw response (debug)</span>
                {rawOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {rawOpen && (
                <div className="max-h-72 overflow-auto border-t bg-background p-4">
                  <pre className="text-xs leading-relaxed">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {hasRows ? (
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
                <div className="col-span-full rounded-xl border bg-background p-6 text-center text-sm text-muted-foreground">
                  No records found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-xl border bg-gradient-to-r from-white/60 to-primary/5 p-5 shadow-inner">
      <div className="mb-3 h-6 w-1/3 rounded bg-slate-200"></div>
      <div className="h-4 w-1/4 rounded bg-slate-200"></div>
    </div>
  )
}
function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-32 animate-pulse rounded-lg border bg-white p-4 shadow-sm',
        className,
      )}
    />
  )
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="text-sm text-foreground/80">
      <span className="text-muted-foreground">{label}: </span>
      <span>{value ?? '—'}</span>
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
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight">
          {deviceName || 'Unnamed device'}
        </h3>
        {productCode && (
          <Badge className="border bg-transparent px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {productCode}
          </Badge>
        )}
      </div>

      <div className="mt-2 space-y-1.5">
        <InfoRow label="Manufacturer" value={manufacturer} />
        <InfoRow label="Device class" value={deviceClass} />
        <InfoRow label="Regulatory note" value={regulatory} />
        <InfoRow
          label="Regulatory status"
          value={regulatoryStatus || 'Unknown'}
        />
        <InfoRow label="Recall status" value={recallStatus} />
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={fetchRecalls}
          aria-pressed={!!recalls}
          variant="destructive"
        >
          Show recalls
        </Button>
      </div>

      {recallsLoading && (
        <div className="mt-2 text-sm text-muted-foreground">
          Loading recalls…
        </div>
      )}
      {recallsError && (
        <div className="mt-2 text-sm text-red-600">{recallsError}</div>
      )}

      {recalls && (
        <div className="mt-3 space-y-2">
          <div className="font-medium text-red-700">
            Recalls ({recalls.length})
          </div>
          {recalls.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No recalls found for this device.
            </div>
          )}
          {recalls.map((rc: any, idx: number) => (
            <div key={idx} className="rounded-lg border bg-yellow-50/70 p-3">
              <div className="text-sm font-semibold">
                {rc.recalling_firm || rc.firm_name || 'Unknown'}
              </div>
              <div className="text-sm">
                Reason: {rc.reason_for_recall || rc.reason || '—'}
              </div>
              <div className="text-sm">
                Affected:{' '}
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
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <h3 className="text-base font-semibold">
        {name || 'Classification record'}
      </h3>
      <div className="mt-2 space-y-1.5 text-sm">
        <InfoRow label="Class" value={cls || '—'} />
        <InfoRow label="Regulation" value={regulation || '—'} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: classification dataset
      </div>
    </div>
  )
}

function K510Card({ record }: { record: any }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <h3 className="text-base font-semibold">
        {record.device_name || record.trade_name || '510(k) record'}
      </h3>
      <div className="mt-2 space-y-1.5 text-sm">
        <InfoRow
          label="Applicant"
          value={record.applicant || record.manufacturer_name || '—'}
        />
        <InfoRow
          label="K number"
          value={record.k_number || record.submission_number || '—'}
        />
        <InfoRow
          label="Decision"
          value={record.decision || record.clearance_date || '—'}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: 510(k) dataset
      </div>
    </div>
  )
}

function PmaCard({ record }: { record: any }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <h3 className="text-base font-semibold">
        {record.device_name || record.trade_name || 'PMA record'}
      </h3>
      <div className="mt-2 space-y-1.5 text-sm">
        <InfoRow label="PMA number" value={record.pma_number || '—'} />
        <InfoRow
          label="Approval date"
          value={record.approval_date || record.approval || '—'}
        />
        <InfoRow
          label="Applicant"
          value={record.applicant || record.manufacturer_name || '—'}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: PMA dataset
      </div>
    </div>
  )
}

function EnforcementCard({ record }: { record: any }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <h3 className="text-base font-semibold">
        Recall:{' '}
        {record.product_description ||
          record.product_type ||
          'Enforcement record'}
      </h3>
      <div className="mt-2 space-y-1.5 text-sm">
        <InfoRow
          label="Firm"
          value={record.recalling_firm || record.firm_name || '—'}
        />
        <InfoRow
          label="Reason"
          value={record.reason_for_recall || record.reason || '—'}
        />
        <InfoRow
          label="Initiation"
          value={formatDate(record.recall_initiation_date)}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Source: enforcement (recalls)
      </div>
    </div>
  )
}
