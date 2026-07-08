'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import type {
  Flashcard,
  FlashcardDeck,
  FlashcardDifficulty,
  FlashcardProgress,
} from '@/data/flashcards'
import { calculateNextReview } from '@/utils/flashcardProgress'
import { subjectToSlug } from '@/data/oneShotNotes'
import { cn } from '@/utils/tailwind'

type StudyAction = 'Again' | 'Next'

const cardGradients = {
  Biology:
    'border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_34%),linear-gradient(135deg,rgba(236,253,245,0.98),rgba(255,255,255,0.96)_46%,rgba(240,253,250,0.96))]',
  Chemistry:
    'border-violet-500/20 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.2),transparent_34%),linear-gradient(135deg,rgba(250,245,255,0.98),rgba(255,255,255,0.96)_48%,rgba(255,247,237,0.96))]',
  Physics:
    'border-sky-500/20 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.22),transparent_34%),linear-gradient(135deg,rgba(240,249,255,0.98),rgba(255,255,255,0.96)_46%,rgba(236,254,255,0.96))]',
  MAT: 'border-amber-500/25 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_34%),linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96)_48%,rgba(238,242,255,0.96))]',
} as const

export function FlashcardStudyClient({ deck }: { deck: FlashcardDeck }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [progress, setProgress] = useState<Record<string, FlashcardProgress>>(
    {},
  )
  const [summary, setSummary] = useState<Record<StudyAction, number>>({
    Again: 0,
    Next: 0,
  })
  const [againQueue, setAgainQueue] = useState<Flashcard[]>([])
  const [complete, setComplete] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const cards = useMemo(
    () => [...deck.cards, ...againQueue],
    [againQueue, deck.cards],
  )
  const card = cards[index]
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('medqas-flashcard-progress')
      const stored = raw
        ? (JSON.parse(raw) as Record<string, FlashcardProgress>)
        : {}
      const deckProgress = Object.fromEntries(
        Object.entries(stored).filter(([cardId]) =>
          deck.cards.some((deckCard) => deckCard.id === cardId),
        ),
      )
      setProgress(deckProgress)
      setSaved(
        Object.fromEntries(
          Object.entries(deckProgress)
            .filter(([, value]) => value.saved)
            .map(([cardId]) => [cardId, true]),
        ),
      )
    } catch {
      setProgress({})
    } finally {
      setLoaded(true)
    }
  }, [deck.cards])

  useEffect(() => {
    if (!loaded) return

    try {
      const raw = window.localStorage.getItem('medqas-flashcard-progress')
      const stored = raw
        ? (JSON.parse(raw) as Record<string, FlashcardProgress>)
        : {}
      const next = { ...stored }

      for (const [cardId, value] of Object.entries(progress)) {
        next[cardId] = {
          ...value,
          saved: Boolean(saved[cardId]),
        }
      }

      window.localStorage.setItem(
        'medqas-flashcard-progress',
        JSON.stringify(next),
      )
    } catch {}
  }, [loaded, progress, saved])

  function rateCard(action: StudyAction) {
    if (!card) return
    const difficulty: FlashcardDifficulty =
      action === 'Again' ? 'Again' : 'Good'
    const current = progress[card.id]
    const next = calculateNextReview(difficulty, current)
    const nextProgress: FlashcardProgress = {
      cardId: card.id,
      difficultyHistory: [...(current?.difficultyHistory ?? []), difficulty],
      saved: Boolean(saved[card.id]),
      ...next,
    }
    setProgress((value) => ({ ...value, [card.id]: nextProgress }))
    setSummary((value) => ({ ...value, [action]: value[action] + 1 }))

    if (action === 'Again' && againQueue.every((item) => item.id !== card.id)) {
      setAgainQueue((value) => [...value, card])
    }

    if (index + 1 >= cards.length) {
      setComplete(true)
      return
    }

    setIndex((value) => value + 1)
    setFlipped(false)
  }

  if (complete) {
    const studied = Object.values(summary).reduce(
      (sum, value) => sum + value,
      0,
    )
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border bg-background/95 p-6 text-center shadow-sm sm:p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700"
          >
            <CheckCircle2 className="h-8 w-8" aria-hidden />
          </motion.div>
          <h1 className="mt-5 text-3xl font-semibold">Session Complete</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You studied {studied} cards from {deck.title}.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {(['Next', 'Again'] as StudyAction[]).map((item) => (
              <div key={item} className="rounded-lg border bg-muted/20 p-4">
                <div className="text-2xl font-semibold">{summary[item]}</div>
                <div className="text-sm text-muted-foreground">{item}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setIndex(0)
                setFlipped(false)
                setComplete(false)
              }}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Continue Revising
            </button>
            <Link
              href="/flashcards"
              className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 text-sm font-semibold hover:bg-muted"
            >
              Back to Flashcards
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/flashcards/${subjectToSlug(deck.subject)}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to decks
      </Link>

      <section className="mt-5 rounded-lg border bg-background/95 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {deck.subject} / {deck.chapter}
            </div>
            <h1 className="mt-1 text-2xl font-semibold">{deck.title}</h1>
          </div>
          <div className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            Card {Math.min(index + 1, cards.length)} of {cards.length}
          </div>
        </div>
      </section>

      {card ? (
        <section className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={card.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="perspective-1000"
            >
              <button
                type="button"
                onClick={() => setFlipped((value) => !value)}
                className="group block w-full text-left outline-none"
                aria-label="Flip flashcard"
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  className="relative min-h-[430px] [transform-style:preserve-3d] sm:min-h-[390px]"
                >
                  <CardFace
                    card={card}
                    flipped={false}
                    saved={Boolean(saved[card.id])}
                  />
                  <CardFace
                    card={card}
                    flipped
                    saved={Boolean(saved[card.id])}
                  />
                </motion.div>
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFlipped((value) => !value)}
                className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Flip
              </button>
              <button
                type="button"
                onClick={() =>
                  card &&
                  setSaved((value) => ({
                    ...value,
                    [card.id]: !value[card.id],
                  }))
                }
                className="inline-flex h-10 items-center gap-2 rounded-md border bg-background px-3 text-sm font-semibold hover:bg-muted"
              >
                <Bookmark className="h-4 w-4" aria-hidden />
                Save
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!flipped}
                onClick={() => rateCard('Again')}
                className={cn(
                  'h-11 rounded-md border px-4 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
                  'hover:bg-red-500/15 border-red-500/30 bg-red-500/10 text-red-700',
                )}
              >
                Again
              </button>
              <button
                type="button"
                disabled={!flipped}
                onClick={() => rateCard('Next')}
                className={cn(
                  'h-11 rounded-md border px-4 text-sm font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
                  'hover:bg-emerald-500/15 border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
                )}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}

function CardFace({
  card,
  flipped,
  saved,
}: {
  card: Flashcard
  flipped: boolean
  saved: boolean
}) {
  return (
    <div
      className={cn(
        'backface-hidden absolute inset-0 flex min-h-[430px] flex-col justify-between overflow-hidden rounded-xl border p-5 shadow-lg shadow-black/5 sm:min-h-[390px] sm:p-8',
        cardGradients[card.subject],
        flipped && '[transform:rotateY(180deg)]',
      )}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border bg-background/75 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
            {card.subject}
          </span>
          <span className="rounded-full border bg-background/75 px-3 py-1 text-xs font-semibold capitalize shadow-sm backdrop-blur">
            {card.type}
          </span>
        </div>
        {saved ? (
          <Bookmark className="h-5 w-5 shrink-0 fill-primary text-primary" />
        ) : null}
      </div>
      <div className="py-7 sm:py-8">
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {flipped ? 'Answer' : 'Question'}
        </div>
        <div className="text-2xl font-semibold leading-8 text-foreground sm:text-3xl sm:leading-10">
          {flipped ? card.back : card.front}
        </div>
        {!flipped && card.hint ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground sm:text-base">
            Hint: {card.hint}
          </p>
        ) : null}
        {flipped && card.explanation ? (
          <p className="mt-5 text-sm leading-6 text-muted-foreground sm:text-base">
            {card.explanation}
          </p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        Tap the card to flip
      </div>
    </div>
  )
}
