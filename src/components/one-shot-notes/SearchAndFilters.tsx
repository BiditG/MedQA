'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import {
  OneShotImportance,
  OneShotNote,
  OneShotSubject,
  oneShotSubjects,
} from '@/data/oneShotNotes'
import { trackEvent } from '@/utils/analytics'
import { OneShotNoteCard } from './OneShotNoteCard'

type SubjectFilter = 'all' | OneShotSubject
type ImportanceFilter = 'all' | OneShotImportance

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function SearchAndFilters({
  notes,
  subject,
}: {
  notes: OneShotNote[]
  subject?: OneShotSubject
}) {
  const [query, setQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>(
    subject ?? 'all',
  )
  const [chapter, setChapter] = useState('all')
  const [importance, setImportance] = useState<ImportanceFilter>('all')

  const chapters = useMemo(
    () => Array.from(new Set(notes.map((note) => note.chapter))).sort(),
    [notes],
  )

  const filteredNotes = useMemo(() => {
    const normalizedQuery = normalize(query)

    return notes.filter((note) => {
      const matchesQuery =
        !normalizedQuery ||
        normalize(
          `${note.title} ${note.subject} ${note.chapter} ${note.topic} ${note.keywords.join(' ')}`,
        ).includes(normalizedQuery)
      const matchesSubject =
        subjectFilter === 'all' || note.subject === subjectFilter
      const matchesChapter = chapter === 'all' || note.chapter === chapter
      const matchesImportance =
        importance === 'all' || note.importance === importance
      return (
        matchesQuery && matchesSubject && matchesChapter && matchesImportance
      )
    })
  }, [chapter, importance, notes, query, subjectFilter])

  return (
    <section id="one-shot-notes-list" className="scroll-mt-24">
      <div className="rounded-lg border bg-background/95 p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <label className="flex h-11 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search One Shot Notes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onBlur={() => {
                if (query.trim()) {
                  trackEvent('one_shot_search_performed', { query })
                }
              }}
              placeholder="Search topic, subject, chapter..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          {!subject ? (
            <Select
              label="Subject"
              value={subjectFilter}
              onChange={(value) => setSubjectFilter(value as SubjectFilter)}
              options={[
                ['all', 'All subjects'],
                ...oneShotSubjects.map(
                  (item) => [item.name, item.name] as const,
                ),
              ]}
            />
          ) : (
            <Select
              label="Chapter"
              value={chapter}
              onChange={setChapter}
              options={[
                ['all', 'All chapters'],
                ...chapters.map((item) => [item, item] as const),
              ]}
            />
          )}

          <Select
            label="Importance"
            value={importance}
            onChange={(value) => setImportance(value as ImportanceFilter)}
            options={[
              ['all', 'All importance'],
              ['High', 'High'],
              ['Medium', 'Medium'],
              ['Low', 'Low'],
            ]}
          />
        </div>
      </div>

      {filteredNotes.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredNotes.map((note) => (
            <OneShotNoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border bg-background/95 p-8 text-center shadow-sm">
          <Search className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">No notes found.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try searching another topic or subject.
          </p>
          <Link
            href="/tutor"
            className="mt-4 inline-flex text-sm font-semibold text-primary"
          >
            Request this note
          </Link>
        </div>
      )}
    </section>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly (readonly [string, string])[]
}) {
  return (
    <label className="grid gap-1">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}
