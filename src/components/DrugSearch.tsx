'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/utils/tailwind'
import { Search, X, Pill, Sparkles, AlertTriangle } from 'lucide-react'

type DrugInfo = {
  brandName: string | null
  genericName: string | null
  drugClass: string | null
  routes: string | null
  dosage: string | null
  sideEffects: string | null
  warnings: string | null
}

function safeJoin(arr: any): string | null {
  if (!arr) return null
  if (Array.isArray(arr)) return arr.join(', ')
  return String(arr)
}

// Simple local fuzzy search used for the client-side glossary fallback
function fuzzySearch(list: string[], q: string, limit = 8) {
  const needle = q.trim().toLowerCase()
  if (!needle) return []
  return list
    .map((s) => ({ s, idx: s.toLowerCase().indexOf(needle) }))
    .filter((x) => x.idx >= 0)
    .sort((a, b) => a.idx - b.idx)
    .slice(0, limit)
    .map((x) => x.s)
}

export default function DrugSearch() {
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DrugInfo | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [glossary, setGlossary] = useState<string[] | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    setResult(null)
    setShowSuggestions(false)
    const q = term.trim()
    if (!q) {
      setError('Please enter a drug name to search.')
      return
    }
    setLoading(true)
    try {
      const url = `/api/drugs?q=${encodeURIComponent(q)}`
      const res = await fetch(url)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg =
          body?.error?.message ||
          `OpenFDA request failed (status ${res.status})`
        setError(msg)
        setLoading(false)
        return
      }
      const data = await res.json()
      const item =
        Array.isArray(data.results) && data.results.length > 0
          ? data.results[0]
          : null
      if (!item) {
        setError('No data found for that drug.')
        setLoading(false)
        return
      }

      const openfda = item.openfda || {}

      const brandName = safeJoin(openfda.brand_name) || null
      const genericName = safeJoin(openfda.generic_name) || null

      const drugClass =
        safeJoin(openfda.pharm_class_epc) ||
        safeJoin(openfda.pharm_class_pe) ||
        safeJoin(openfda.pharm_class_cs) ||
        safeJoin(openfda.pharm_class_moa) ||
        null

      const routes = safeJoin(openfda.route) || safeJoin(item.route) || null

      const dosage =
        safeJoin(openfda.dosage_and_administration) ||
        (Array.isArray(item.dosage_and_administration)
          ? item.dosage_and_administration[0]
          : null) ||
        null

      const sideEffects = Array.isArray(item.adverse_reactions)
        ? item.adverse_reactions.join('\n\n')
        : item.adverse_reactions || null
      const warnings = Array.isArray(item.warnings)
        ? item.warnings.join('\n\n')
        : item.warnings || null

      setResult({
        brandName,
        genericName,
        drugClass,
        routes,
        dosage,
        sideEffects,
        warnings,
      })
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!term.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const q = term.trim()
    const local = glossary ? fuzzySearch(glossary, q, 8) : []
    if (local.length) {
      setSuggestions(local)
      setShowSuggestions(true)
      setActiveIndex(-1)
      return
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const url = `/api/drugs?q=${encodeURIComponent(term.trim())}&limit=8`
        const res = await fetch(url)
        if (!res.ok) return
        const data = await res.json()
        const items = Array.isArray(data.results) ? data.results : []
        const names = items
          .map((it: any) => {
            const of = it.openfda || {}
            return (
              (Array.isArray(of.brand_name)
                ? of.brand_name[0]
                : of.brand_name) ||
              (Array.isArray(of.generic_name)
                ? of.generic_name[0]
                : of.generic_name) ||
              it.brand_name ||
              it.generic_name ||
              ''
            )
          })
          .filter(Boolean) as string[]
        setSuggestions(names)
        setShowSuggestions(names.length > 0)
        setActiveIndex(-1)
      } catch {
        // ignore suggestion errors
      }
    }, 180)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [term, glossary])

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

  async function loadGlossary() {
    if (glossary) return
    try {
      const res = await fetch('/drug-glossary.json')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) setGlossary(data as string[])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!showSuggestions) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          e.preventDefault()
          const pick = suggestions[activeIndex]
          setTerm(pick)
          setShowSuggestions(false)
          handleSearch()
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSuggestions, suggestions, activeIndex])

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-5xl px-4 md:px-6">
      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-transparent to-primary/5 p-[1px]">
        <div className="rounded-2xl bg-background p-4 shadow-lg sm:p-6">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
                <Pill className="h-3.5 w-3.5" /> OpenFDA Drugs
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Drug Lookup
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Search drug labels for brand, generic, dosing and safety info.
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              Tips: try a brand or generic name (e.g. <em>ibuprofen</em>).
              Suggestions appear as you type.
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="drug-search" className="sr-only">
              Search drug
            </label>
            <div className="relative w-full flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                id="drug-search"
                className="w-full rounded-2xl bg-input py-3 pl-11 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="e.g. ibuprofen or paracetamol"
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => {
                  loadGlossary()
                  if (suggestions.length) setShowSuggestions(true)
                }}
                disabled={loading}
                autoComplete="off"
              />
              {term && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setTerm('')
                    setResult(null)
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
                        handleSearch()
                      }}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-primary/5',
                        idx === activeIndex && 'bg-primary/5',
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
                type="submit"
                className="w-full px-5 py-2 sm:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-white"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        fill="currentColor"
                      ></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Search'
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setTerm('')
                  setResult(null)
                  setSuggestions([])
                  setShowSuggestions(false)
                  inputRef.current?.focus()
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Error */}
          {error && !loading && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-6 space-y-6">
              <div className="animate-pulse rounded-2xl border bg-gradient-to-r from-white/60 to-primary/5 p-5 shadow-inner">
                <div className="mb-3 h-6 w-1/3 rounded bg-slate-200"></div>
                <div className="h-4 w-1/4 rounded bg-slate-200"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-28 animate-pulse rounded-lg border bg-white p-4 shadow-sm"></div>
                <div className="h-28 animate-pulse rounded-lg border bg-white p-4 shadow-sm"></div>
                <div className="h-36 animate-pulse rounded-lg border bg-white p-4 shadow-sm md:col-span-2"></div>
                <div className="h-24 animate-pulse rounded-lg border bg-white p-4 shadow-sm md:col-span-2"></div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="mt-6 space-y-6">
              <Card className="border bg-gradient-to-r from-white/60 to-primary/5 shadow-inner">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-extrabold">
                        {result.brandName ?? result.genericName ?? 'Unknown'}
                      </h3>
                      {result.genericName && (
                        <div className="mt-1 text-sm text-muted-foreground">
                          Generic: {result.genericName}
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.drugClass && (
                          <Badge className="bg-primary/10 text-primary">
                            {result.drugClass}
                          </Badge>
                        )}
                        {result.routes && (
                          <Badge className="bg-accent/10 text-accent-foreground">
                            {result.routes}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Data from OpenFDA — simplified for readability
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">
                      Dosage & Administration
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                      {result.dosage ?? 'Not available'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">
                      Route(s) of administration
                    </div>
                    <div className="mt-2 text-sm">
                      {result.routes ?? 'Not available'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white md:col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Side effects / Adverse reactions
                      </div>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {result.sideEffects ?? 'Not available'}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white md:col-span-2">
                  <CardContent className="p-4">
                    <div className="text-xs text-muted-foreground">
                      Warnings & Precautions
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {result.warnings ?? 'Not available'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Nice empty state */}
          {!result && !loading && !error && (
            <div className="mt-6 rounded-xl border bg-muted/30 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
              <div className="mt-2 text-sm text-muted-foreground">
                Start typing a drug name above to see details.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
