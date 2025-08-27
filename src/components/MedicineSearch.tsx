'use client'

import { useEffect, useMemo, useState } from 'react'

type Medicine = {
  name: string
  composition: string
  uses: string
  side_effects: string
  image: string
  manufacturer: string
  excellent: string
  average: string
  poor: string
}

function parseCsv(text: string): Medicine[] {
  const lines = text.split(/\r?\n/)
  const out: Medicine[] = []
  // naive CSV parse that handles quoted commas
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const cols: string[] = []
    let cur = ''
    let inQuotes = false
    for (let j = 0; j < line.length; j++) {
      const ch = line[j]
      if (ch === '"') {
        inQuotes = !inQuotes
        continue
      }
      if (ch === ',' && !inQuotes) {
        cols.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
    cols.push(cur)
    // Expect at least 9 columns (as per CSV header)
    if (cols.length < 9) continue
    out.push({
      name: cols[0],
      composition: cols[1],
      uses: cols[2],
      side_effects: cols[3],
      image: cols[4],
      manufacturer: cols[5],
      excellent: cols[6],
      average: cols[7],
      poor: cols[8],
    })
  }
  return out
}

export default function MedicineSearch() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Medicine[]>([])
  const [query, setQuery] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [limit, setLimit] = useState(24)
  const [selected, setSelected] = useState<Medicine | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/data/Medicine_Details.csv')
        const txt = await res.text()
        if (cancelled) return
        const parsed = parseCsv(txt)
        // drop header row if present
        if (
          parsed.length &&
          parsed[0].name?.toLowerCase().includes('medicine name')
        )
          parsed.shift()
        setData(parsed)
      } catch (e) {
        console.error('Failed to load medicines CSV', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // close modal with Escape for better mobile/keyboard UX
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const manufacturers = useMemo(() => {
    const s = new Set<string>()
    for (const d of data) s.add(d.manufacturer || 'Unknown')
    return Array.from(s).slice(0, 200)
  }, [data])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = data
    if (manufacturer) out = out.filter((d) => d.manufacturer === manufacturer)
    if (q)
      out = out.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.composition.toLowerCase().includes(q) ||
          d.uses.toLowerCase().includes(q),
      )
    return out
  }, [data, query, manufacturer])

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-lg font-semibold">Medicine directory (CSV)</h3>

      {/* Search & Filters: stack on mobile, inline on larger screens */}
      <div className="mb-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="med-search" className="sr-only">
            Search medicines
          </label>
          <input
            id="med-search"
            aria-label="Search medicines"
            placeholder="Search by name, composition or use"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex-shrink-0 sm:ml-3 sm:w-64">
          <label htmlFor="manufacturer" className="sr-only">
            Manufacturer
          </label>
          <select
            id="manufacturer"
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All manufacturers</option>
            {manufacturers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-3 text-sm text-muted-foreground">
        {loading ? 'Loading…' : `${results.length.toLocaleString()} medicines`}
      </div>

      {/* Responsive grid: 1 on xs, 2 on sm, 3 on md, 4 on lg */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {(() => {
          const items: Medicine[] = loading
            ? Array.from({ length: 6 }).map(() => ({
                name: '',
                composition: '',
                uses: '',
                side_effects: '',
                image: '',
                manufacturer: '',
                excellent: '',
                average: '',
                poor: '',
              }))
            : results.slice(0, limit)
          return items.map((d, i) => (
            <article
              key={d.name || i}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
              onClick={() => !loading && setSelected(d)}
              aria-label={d.name || `medicine-${i}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setSelected(d)
              }}
            >
              {loading ? (
                <div className="h-40 animate-pulse bg-slate-100" />
              ) : (
                <>
                  <div className="flex items-center gap-3 p-4">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-slate-100">
                      {d.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={d.image}
                          alt={d.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{d.name}</div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {d.manufacturer}
                      </div>
                    </div>
                  </div>
                  <div className="line-clamp-3 px-4 pb-4 pt-0 text-sm text-muted-foreground">
                    {d.uses}
                  </div>
                </>
              )}
            </article>
          ))
        })()}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {!loading && results.length > limit && (
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => setLimit((l) => l + 24)}
            aria-label="Show more medicines"
          >
            Show more
          </button>
        )}
      </div>

      {/* Modal / detail panel (responsive) */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl overflow-auto rounded bg-white p-6 shadow-lg sm:rounded-lg sm:p-6">
            <button
              onClick={() => setSelected(null)}
              aria-label="Close details"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-muted-foreground shadow hover:bg-muted/5"
            >
              ✕
            </button>

            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-shrink-0">
                {selected.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="h-28 w-28 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded bg-slate-100 text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{selected.name}</h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selected.manufacturer}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-medium">Composition</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {selected.composition || '—'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Uses</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {selected.uses || '—'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Side effects</h3>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {selected.side_effects || '—'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Reviews (approx)</h3>
                <p className="text-sm text-muted-foreground">
                  Excellent: {selected.excellent}% • Avg: {selected.average}% •
                  Poor: {selected.poor}%
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-md border px-3 py-2"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
