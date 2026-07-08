'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Sparkles } from 'lucide-react'
import type { FlashcardDeck } from '@/data/flashcards'
import { oneShotSubjects } from '@/data/oneShotNotes'
import { FlashcardDeckCard } from './FlashcardDeckCard'

export function FlashcardsHomeClient({ decks }: { decks: FlashcardDeck[] }) {
  const [query, setQuery] = useState('')
  const filteredDecks = useMemo(() => {
    const value = query.toLowerCase().trim()
    return decks.filter((deck) =>
      `${deck.title} ${deck.subject} ${deck.chapter} ${deck.topic}`
        .toLowerCase()
        .includes(value),
    )
  }, [decks, query])

  const popularDecks = decks.slice(0, 6)
  const recentDecks = decks.slice(-6).reverse()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-lg border bg-background/95 shadow-sm">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Smart spaced revision
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Master CEE Concepts with Smart Flashcards
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Colorful animated flashcards with spaced revision to help you
              remember Biology, Chemistry, Physics, and MAT faster.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link className="vibrant-btn" href="#browse-flashcards">
                Start Today&apos;s Revision
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-semibold hover:bg-muted"
                href="#browse-flashcards"
              >
                Browse Flashcards
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-56 from-sky-500/15 to-emerald-500/15 relative rounded-xl bg-gradient-to-br via-background p-4"
          >
            {['Pulmonary artery?', 'F = ma', 'SN1 vs SN2', 'Series trick'].map(
              (item, index) => (
                <motion.div
                  key={item}
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.25,
                  }}
                  className="absolute rounded-lg border bg-background/90 px-4 py-3 text-sm font-semibold shadow-sm"
                  style={{
                    left: `${12 + index * 16}%`,
                    top: `${18 + (index % 2) * 34}%`,
                  }}
                >
                  {item}
                </motion.div>
              ),
            )}
          </motion.div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Browse by Subject</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {oneShotSubjects.map((subject) => (
            <Link
              key={subject.slug}
              href={`/flashcards/${subject.slug}`}
              className="rounded-lg border bg-background/95 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <subject.icon className="h-6 w-6 text-primary" aria-hidden />
              <h3 className="mt-3 font-semibold">{subject.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {decks.filter((deck) => deck.subject === subject.name).length}{' '}
                decks ready for revision.
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="browse-flashcards" className="mt-8 scroll-mt-24">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Flashcard Decks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search CEE decks by topic, chapter, or subject.
            </p>
          </div>
          <label className="min-w-72 flex h-11 items-center gap-2 rounded-md border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Search flashcards</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search deck..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(query ? filteredDecks : popularDecks).map((deck) => (
            <FlashcardDeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Recently Added Decks</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {recentDecks.map((deck) => (
            <FlashcardDeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </section>
    </main>
  )
}
