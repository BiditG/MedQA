'use client'

import { Fragment, useMemo, useState } from 'react'
import {
  Atom,
  Calculator,
  ClipboardList,
  FlaskConical,
  Search,
} from 'lucide-react'
import { formulaBank } from '@/data/formulaBank'
import { cn } from '@/utils/tailwind'

type SubjectFilter = 'all' | 'physics' | 'chemistry'

const subjectOptions: Array<{
  value: SubjectFilter
  label: string
  icon: typeof ClipboardList
}> = [
  { value: 'all', label: 'All', icon: ClipboardList },
  { value: 'physics', label: 'Physics', icon: Atom },
  { value: 'chemistry', label: 'Chemistry', icon: FlaskConical },
]

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function prettifyMathText(value: string) {
  return value
    .replace(/\+\/-/g, '±')
    .replace(/-\/\+/g, '∓')
    .replace(/>=/g, '≥')
    .replace(/<=/g, '≤')
    .replace(/\bproportional to\b/g, '∝')
    .replace(/\bsqrt\b/g, '√')
    .replace(/\bsum\b/g, 'Σ')
    .replace(/\bepsilon0\b/g, 'ε₀')
    .replace(/\bmu0\b/g, 'μ₀')
    .replace(/\btheta\b/g, 'θ')
    .replace(/\blambda\b/g, 'λ')
    .replace(/\bomega\b/g, 'ω')
    .replace(/\balpha\b/g, 'α')
    .replace(/\bbeta\b/g, 'β')
    .replace(/\bgamma\b/g, 'γ')
    .replace(/\brho\b/g, 'ρ')
    .replace(/\bphi\b/g, 'φ')
    .replace(/\btau\b/g, 'τ')
    .replace(/\beta\b/g, 'η')
    .replace(/\bkappa\b/g, 'κ')
    .replace(/\bdelta\b/g, 'Δ')
    .replace(/\bpi\b/g, 'π')
    .replace(/ x /g, ' × ')
}

function readScript(expression: string, startIndex: number) {
  if (expression[startIndex] === '(') {
    let depth = 0

    for (let index = startIndex; index < expression.length; index++) {
      const character = expression[index]

      if (character === '(') depth += 1
      if (character === ')') depth -= 1

      if (depth === 0) {
        return {
          value: expression.slice(startIndex + 1, index),
          nextIndex: index + 1,
        }
      }
    }
  }

  let endIndex = startIndex
  while (
    endIndex < expression.length &&
    /[A-Za-z0-9+\-./]/.test(expression[endIndex])
  ) {
    endIndex += 1
  }

  return {
    value: expression.slice(startIndex, endIndex),
    nextIndex: endIndex,
  }
}

function ReadableFormula({ expression }: { expression: string }) {
  const parts = []
  let textBuffer = ''

  function flushText() {
    if (!textBuffer) return
    parts.push(prettifyMathText(textBuffer))
    textBuffer = ''
  }

  for (let index = 0; index < expression.length; index++) {
    const character = expression[index]

    if (character === '^' || character === '_') {
      flushText()
      const script = readScript(expression, index + 1)
      const content = prettifyMathText(script.value)
      const key = `${character}-${index}-${script.value}`

      parts.push(
        character === '^' ? (
          <sup key={key} className="text-[0.68em] leading-none">
            {content}
          </sup>
        ) : (
          <sub key={key} className="text-[0.68em] leading-none">
            {content}
          </sub>
        ),
      )
      index = script.nextIndex - 1
    } else {
      textBuffer += character
    }
  }

  flushText()

  return (
    <div className="mt-3 min-w-0 rounded-md border bg-muted/20 px-3 py-3 sm:px-4">
      <div className="min-w-0 whitespace-normal break-words font-serif text-lg font-semibold leading-8 text-primary sm:text-xl sm:leading-9">
        {parts.map((part, index) =>
          typeof part === 'string' ? (
            <Fragment key={`${part}-${index}`}>{part}</Fragment>
          ) : (
            part
          ),
        )}
      </div>
    </div>
  )
}

export function FormulaBankClient() {
  const [subject, setSubject] = useState<SubjectFilter>('all')
  const [query, setQuery] = useState('')
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(
    formulaBank[0]?.id,
  )

  const filteredChapters = useMemo(() => {
    const normalizedQuery = normalize(query)

    return formulaBank
      .filter((chapter) => subject === 'all' || chapter.subject === subject)
      .map((chapter) => ({
        ...chapter,
        formulas: chapter.formulas.filter((formula) => {
          if (!normalizedQuery) return true

          return normalize(
            `${chapter.title} ${formula.name} ${formula.expression} ${formula.note}`,
          ).includes(normalizedQuery)
        }),
      }))
      .filter((chapter) => chapter.formulas.length > 0)
  }, [query, subject])

  const activeChapter =
    filteredChapters.find((chapter) => chapter.id === activeChapterId) ??
    filteredChapters[0]
  const formulaCount = filteredChapters.reduce(
    (sum, chapter) => sum + chapter.formulas.length,
    0,
  )

  return (
    <div className="w-full overflow-x-hidden px-0 py-2 sm:px-4">
      <section className="mx-auto max-w-6xl overflow-x-hidden">
        <div className="mb-5 px-1 sm:mb-6 sm:px-0">
          <div className="border-primary/15 mb-3 inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Calculator className="h-3.5 w-3.5" aria-hidden />
            CEE formula revision
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Formula Bank
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Chapter-wise Physics and Chemistry formulas for fast CEE revision.
            Use search when you remember the idea but not the exact relation.
          </p>
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[300px_1fr]">
          <aside className="min-w-0 space-y-4">
            <div className="rounded-lg border bg-background/95 p-3 shadow-sm sm:p-4">
              <label className="text-sm font-semibold" htmlFor="formula-search">
                Search formulas
              </label>
              <div className="mt-2 flex h-11 items-center gap-2 rounded-md border bg-background px-3">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                <input
                  id="formula-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Nernst, projectile, pH"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-md border">
                {subjectOptions.map((option) => {
                  const Icon = option.icon
                  const selected = subject === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSubject(option.value)
                        setActiveChapterId(undefined)
                      }}
                      className={cn(
                        'inline-flex h-10 items-center justify-center gap-1.5 border-r px-2 text-xs font-semibold text-muted-foreground last:border-r-0 hover:bg-primary/5 hover:text-primary',
                        selected &&
                          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniStat label="Chapters" value={filteredChapters.length} />
                <MiniStat label="Formulas" value={formulaCount} />
              </div>
            </div>

            <div className="rounded-lg border bg-background/95 p-2 shadow-sm">
              <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase text-muted-foreground">
                Chapters
              </div>
              <div className="grid gap-2 pb-1 sm:grid-cols-2 xl:block xl:max-h-[520px] xl:space-y-1 xl:overflow-y-auto xl:pr-1">
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
                          {chapter.formulas.length}
                        </span>
                      </div>
                      <div className="mt-1 text-xs capitalize text-muted-foreground">
                        {chapter.subject}
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
                        {activeChapter.subject}
                      </div>
                      <h2 className="mt-1 text-2xl font-semibold">
                        {activeChapter.title}
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {activeChapter.summary}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/25 px-3 py-2 text-sm font-semibold">
                      {activeChapter.formulas.length} formulas
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-3 sm:p-4 lg:grid-cols-2">
                  {activeChapter.formulas.map((formula) => (
                    <article
                      key={`${activeChapter.id}-${formula.name}`}
                      className="min-w-0 rounded-md border bg-background p-3 sm:p-4"
                    >
                      <div className="text-sm font-semibold">
                        {formula.name}
                      </div>
                      <ReadableFormula expression={formula.expression} />
                      <p className="mt-3 text-xs leading-5 text-muted-foreground">
                        {formula.note}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-background/95 p-8 text-center shadow-sm">
                <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                <h2 className="mt-3 text-lg font-semibold">
                  No formulas found
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different subject or search term.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
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
