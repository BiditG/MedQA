'use client'

import { useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, FlaskConical, Search } from 'lucide-react'
import { organicReactionChapters } from '@/data/organicReactions'
import { cn } from '@/utils/tailwind'

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function OrganicReactionsClient() {
  const [query, setQuery] = useState('')
  const [activeChapterId, setActiveChapterId] = useState(
    organicReactionChapters[0]?.id,
  )

  const filteredChapters = useMemo(() => {
    const normalizedQuery = normalize(query)

    return organicReactionChapters
      .map((chapter) => ({
        ...chapter,
        reactions: chapter.reactions.filter((reaction) => {
          if (!normalizedQuery) return true

          return normalize(
            `${chapter.title} ${reaction.name} ${reaction.reactant} ${reaction.reagent} ${reaction.product} ${reaction.condition} ${reaction.note}`,
          ).includes(normalizedQuery)
        }),
      }))
      .filter((chapter) => chapter.reactions.length > 0)
  }, [query])

  const activeChapter =
    filteredChapters.find((chapter) => chapter.id === activeChapterId) ??
    filteredChapters[0]
  const reactionCount = filteredChapters.reduce(
    (sum, chapter) => sum + chapter.reactions.length,
    0,
  )

  return (
    <div className="w-full overflow-x-hidden px-0 py-2 sm:px-4">
      <section className="mx-auto max-w-6xl overflow-x-hidden">
        <div className="mb-5 px-1 sm:mb-6 sm:px-0">
          <div className="border-primary/15 mb-3 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden />
            CEE organic chemistry
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Organic Reactions
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Search chapter-wise organic reactions with visual reaction schemes,
            reagents, conditions, and exam-focused notes.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[300px_1fr]">
          <aside className="min-w-0 space-y-4">
            <div className="rounded-lg border bg-background/95 p-3 shadow-sm sm:p-4">
              <label
                className="text-sm font-semibold"
                htmlFor="reaction-search"
              >
                Search reactions
              </label>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                <input
                  id="reaction-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. aldol, Grignard, phenol"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat label="Chapters" value={filteredChapters.length} />
                <MiniStat label="Reactions" value={reactionCount} />
              </div>
            </div>

            <div className="rounded-lg border bg-background/95 p-2 shadow-sm">
              <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase text-muted-foreground">
                Organic chapters
              </div>
              <div className="grid gap-2 pb-1 sm:grid-cols-2 xl:block xl:max-h-[560px] xl:space-y-1 xl:overflow-y-auto xl:pr-1">
                {filteredChapters.map((chapter) => {
                  const selected = activeChapter?.id === chapter.id

                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => setActiveChapterId(chapter.id)}
                      className={cn(
                        'w-full min-w-0 rounded-md px-3 py-2 text-left transition-colors hover:bg-primary/5',
                        selected && 'bg-primary/10 text-primary',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">
                          {chapter.title}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {chapter.reactions.length}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            {activeChapter ? (
              <div className="rounded-lg border bg-background/95 shadow-sm">
                <div className="border-b px-4 py-4 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase text-muted-foreground">
                        Organic chemistry
                      </div>
                      <h2 className="mt-1 text-2xl font-semibold">
                        {activeChapter.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {activeChapter.summary}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/25 px-3 py-2 text-sm font-semibold">
                      {activeChapter.reactions.length} reactions
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-3 sm:p-4">
                  {activeChapter.reactions.map((reaction) => (
                    <article
                      key={`${activeChapter.id}-${reaction.name}`}
                      className="min-w-0 rounded-md border bg-background p-3 sm:p-4"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-base font-semibold">
                            {reaction.name}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {reaction.note}
                          </p>
                        </div>
                        <span className="w-fit rounded-full border bg-muted/30 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          {reaction.condition}
                        </span>
                      </div>

                      <ReactionScheme
                        reactant={reaction.reactant}
                        reagent={reaction.reagent}
                        product={reaction.product}
                      />
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-background/95 p-8 text-center shadow-sm">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <h2 className="mt-3 text-lg font-semibold">
                  No reactions found
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different reaction, reagent, or chapter name.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}

function ReactionScheme({
  reactant,
  reagent,
  product,
}: {
  reactant: string
  reagent: string
  product: string
}) {
  return (
    <div className="mt-4 rounded-md border bg-muted/20 p-3">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[1fr_180px_1fr] lg:items-center">
        <MoleculeBox label="Reactant" value={reactant} />
        <div className="text-center">
          <div className="mb-1 break-words rounded-md border bg-background px-2 py-1 text-[11px] font-semibold text-muted-foreground">
            {reagent}
          </div>
          <div className="hidden items-center justify-center text-primary lg:flex">
            <div className="h-px flex-1 bg-primary/40" />
            <ArrowRight className="mx-2 h-5 w-5 shrink-0" aria-hidden />
            <div className="h-px flex-1 bg-primary/40" />
          </div>
          <div className="flex justify-center text-primary lg:hidden">
            <ArrowDown className="h-5 w-5" aria-hidden />
          </div>
        </div>
        <MoleculeBox label="Product" value={product} />
      </div>
    </div>
  )
}

function MoleculeBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-20 min-w-0 rounded-md border bg-background px-3 py-2">
      <div className="text-[11px] font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 break-words font-serif text-base font-semibold leading-7 sm:text-lg">
        {value}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-muted/20 px-3 py-2">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  )
}
