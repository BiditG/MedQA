'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { FlashcardDeck } from '@/data/flashcards'
import { FlashcardDeckCard } from './FlashcardDeckCard'

export function FlashcardsSubjectClient({
  subject,
  decks,
}: {
  subject: string
  decks: FlashcardDeck[]
}) {
  const [query, setQuery] = useState('')
  const [chapter, setChapter] = useState('all')
  const [topic, setTopic] = useState('all')
  const chapters = useMemo(
    () => Array.from(new Set(decks.map((deck) => deck.chapter))).sort(),
    [decks],
  )
  const topics = useMemo(
    () =>
      Array.from(
        new Set(
          decks
            .filter((deck) => chapter === 'all' || deck.chapter === chapter)
            .map((deck) => deck.topic),
        ),
      ).sort(),
    [chapter, decks],
  )
  const filteredDecks = useMemo(() => {
    const value = query.toLowerCase().trim()
    return decks.filter((deck) => {
      const matchesQuery =
        !value ||
        `${deck.title} ${deck.chapter} ${deck.topic}`
          .toLowerCase()
          .includes(value)
      const matchesChapter = chapter === 'all' || deck.chapter === chapter
      const matchesTopic = topic === 'all' || deck.topic === topic
      return matchesQuery && matchesChapter && matchesTopic
    })
  }, [chapter, decks, query, topic])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-lg border bg-background/95 p-5 shadow-sm sm:p-7">
        <div className="inline-flex rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Flashcard Decks
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          {subject} Flashcards
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Animated CEE flashcards grouped by chapter, topic, formulas, traps,
          diagrams, and memory hooks.
        </p>
      </section>

      <section className="mt-6 rounded-lg border bg-background/95 p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_240px_240px]">
          <label className="flex h-11 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search decks</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search topic, chapter, deck..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={chapter}
            onChange={(event) => {
              setChapter(event.target.value)
              setTopic('all')
            }}
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <option value="all">All chapters</option>
            {chapters.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <option value="all">All topics</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="mt-4 grid gap-6">
        {groupDecksByChapter(filteredDecks).map(
          ([chapterTitle, chapterDecks]) => (
            <div key={chapterTitle}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{chapterTitle}</h2>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {chapterDecks.length} topics
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {chapterDecks.map((deck) => (
                  <FlashcardDeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            </div>
          ),
        )}
      </section>
    </main>
  )
}

function groupDecksByChapter(decks: FlashcardDeck[]) {
  const map = new Map<string, FlashcardDeck[]>()

  for (const deck of decks) {
    const list = map.get(deck.chapter) ?? []
    list.push(deck)
    map.set(deck.chapter, list)
  }

  return Array.from(map.entries())
}
