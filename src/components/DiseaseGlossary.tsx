'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/tailwind'

type Entry = { english: string; nepali: string }

function fuzzySearch(list: string[], q: string, limit = 12) {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return list
    .map((s) => ({ s, idx: s.toLowerCase().indexOf(needle) }))
    .filter((x) => x.idx >= 0)
    .sort((a, b) => a.idx - b.idx)
    .slice(0, limit)
    .map((x) => x.s)
}

export default function DiseaseGlossary() {
  const [term, setTerm] = useState('')
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/disease-glossary.json')
        if (!res.ok) return
        const data = await res.json()
        setEntries(data as Entry[])
      } catch {}
    }
    load()
  }, [])

  useEffect(() => {
    if (!term.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const q = term.trim()
    const english = entries ? entries.map((e) => e.english) : []
    const nepali = entries ? entries.map((e) => e.nepali) : []
    const local = fuzzySearch([...english, ...nepali], q, 12)
    setSuggestions(local)
    setShowSuggestions(local.length > 0)
  }, [term, entries])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return
      if (!(e.target instanceof Node)) return
      if (!containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const results = React.useMemo(() => {
    const list = entries ?? []
    if (!term.trim()) return list
    const q = term.trim().toLowerCase()
    return list.filter(
      (e) =>
        e.english.toLowerCase().includes(q) ||
        e.nepali.toLowerCase().includes(q),
    )
  }, [entries, term])

  // Reset to first page when results or pageSize change
  React.useEffect(() => setPage(1), [term, pageSize])

  const total = results.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const startIdx = (page - 1) * pageSize
  const paged = results.slice(startIdx, startIdx + pageSize)

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-6xl px-4 md:px-6">
      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-transparent to-primary/5 p-[1px]">
        <div className="rounded-2xl bg-background p-4 shadow-lg sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Nepali Glossary
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Disease Glossary — English ↔ Nepali
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search an index of English disease names and their Nepali
                equivalents.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="disease-search" className="sr-only">
              Search disease
            </label>
            <div className="relative w-full flex-1">
              <Input
                ref={inputRef}
                id="disease-search"
                className="w-full rounded-2xl bg-input py-3 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. tuberculosis or क्षयरोग"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  if (suggestions.length) setShowSuggestions(true)
                }}
                autoComplete="off"
              />

              {term && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setTerm('')
                    setSuggestions([])
                    setShowSuggestions(false)
                    inputRef.current?.focus()
                  }}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/10"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-2xl border bg-background py-1 shadow-2xl">
                  {suggestions.map((s, idx) => (
                    <button
                      key={s + idx}
                      onClick={() => {
                        setTerm(s)
                        setShowSuggestions(false)
                      }}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-primary/5',
                      )}
                    >
                      <span className="font-medium">{s}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                className="w-full px-5 py-2 sm:w-auto"
                onClick={() => setTerm('')}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(total, startIdx + 1)}-
                {Math.min(total, startIdx + pageSize)} of {total}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">
                  Per page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                >
                  {[6, 12, 24, 48].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {paged.map((r) => (
                <Card key={r.english + r.nepali} className="bg-white">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">English</div>
                    <div className="mt-1 text-sm font-medium">{r.english}</div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Nepali
                    </div>
                    <div className="mt-1 text-sm">{r.nepali}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <div className="text-sm">
                Page {page} of {totalPages}
              </div>
              <button
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
