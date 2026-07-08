'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, Clock3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import { OneShotNote, OneShotSubject, subjectToSlug } from '@/data/oneShotNotes'
import { trackEvent } from '@/utils/analytics'
import { ImportanceBadge } from './badges'
import { MCQAccordion } from './MCQAccordion'
import { NoteTableOfContents } from './NoteTableOfContents'
import {
  CEETrapsBox,
  CommonMistakesBox,
  DiagramInWordsBox,
  FinalRevisionBox,
  KeySectionRenderer,
  MustRememberBox,
  PdfDownloadButton,
} from './NoteBlocks'
import { OneShotNoteCard } from './OneShotNoteCard'

export function OneShotNoteReader({
  note,
  mdxContent,
  relatedNotes,
}: {
  note: OneShotNote
  mdxContent?: string
  relatedNotes: OneShotNote[]
}) {
  useEffect(() => {
    trackEvent('one_shot_note_opened', {
      title: note.title,
      subject: note.subject,
    })
  }, [note.subject, note.title])

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/one-shot-notes/${subjectToSlug(note.subject as OneShotSubject)}`}
        className="text-sm font-medium text-muted-foreground hover:text-primary"
      >
        Back to {note.subject} notes
      </Link>

      <div className="mt-5 grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="lg:order-1">
          <NoteTableOfContents />
        </div>

        <article className="min-w-0 rounded-lg border bg-background/95 shadow-sm">
          <header className="border-b p-5 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <ImportanceBadge importance={note.importance} />
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {note.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {note.subject} / {note.chapter} / {note.topic}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" aria-hidden />
                {note.readingTime}
              </span>
              <span>Last updated {note.lastUpdated}</span>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <span
                onClick={() => {
                  if (note.pdfUrl) {
                    trackEvent('one_shot_pdf_downloaded', { title: note.title })
                  }
                }}
              >
                <PdfDownloadButton note={note} />
              </span>
              <Button variant="outline" type="button">
                <Bookmark className="mr-2 h-4 w-4" aria-hidden />
                Bookmark
              </Button>
            </div>
          </header>

          {mdxContent ? (
            <MdxNoteContent content={mdxContent} />
          ) : (
            <div className="grid gap-8 p-5 sm:p-7">
              <Section id="concept" title="Concept in Simple Words">
                <p className="text-sm leading-7 text-muted-foreground">
                  {note.concept}
                </p>
                <h3 className="mt-5 text-base font-semibold">
                  Why This Topic Matters in CEE
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {note.whyItMatters}
                </p>
              </Section>

              <Section id="must-remember" title="Must Remember Points">
                <MustRememberBox points={note.mustRemember} />
              </Section>

              <Section id="diagram" title="Diagram in Words">
                <DiagramInWordsBox value={note.diagramInWords} />
              </Section>
              <Section id="key-section" title="Key Formula / Reaction / Table">
                <KeySectionRenderer keySection={note.keySection} />
              </Section>
              <Section id="cee-traps" title="CEE Traps">
                <CEETrapsBox traps={note.ceeTraps} />
              </Section>
              <Section id="common-mistakes" title="Common Mistakes">
                <CommonMistakesBox mistakes={note.commonMistakes} />
              </Section>
              <Section id="quick-mcqs" title="Quick MCQs">
                <MCQAccordion mcqs={note.mcqs} noteTitle={note.title} />
              </Section>
              <Section id="final-revision" title="Final Revision Box">
                <FinalRevisionBox value={note.finalRevision} />
              </Section>
            </div>
          )}
        </article>
      </div>

      {relatedNotes.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold">Related Notes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedNotes.map((relatedNote) => (
              <OneShotNoteCard key={relatedNote.id} note={relatedNote} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

function MdxNoteContent({ content }: { content: string }) {
  return (
    <div className="one-shot-mdx p-5 sm:p-7">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 text-2xl font-semibold first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              id={oneShotHeadingId(children)}
              className="mt-8 scroll-mt-24 text-xl font-semibold first:mt-0"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-base font-semibold">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {children}
            </p>
          ),
          ul: ({ children }) => <ul className="mt-4 grid gap-2">{children}</ul>,
          ol: ({ children }) => (
            <ol className="mt-4 grid list-decimal gap-2 pl-5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="rounded-md border bg-background p-3 text-sm leading-6">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-7">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          table: ({ children }) => (
            <div className="mt-5 overflow-x-auto rounded-md border">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/70 text-xs uppercase text-muted-foreground">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 align-top text-muted-foreground">
              {children}
            </td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-muted px-1 py-0.5 text-[0.9em]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function oneShotHeadingId(children: React.ReactNode) {
  const text = flattenText(children).toLowerCase()

  if (text.includes('concept')) return 'concept'
  if (text.includes('must remember')) return 'must-remember'
  if (text.includes('diagram')) return 'diagram'
  if (
    text.includes('formula') ||
    text.includes('reaction') ||
    text.includes('table') ||
    text.includes('shortcut')
  ) {
    return 'key-section'
  }
  if (text.includes('trap')) return 'cee-traps'
  if (text.includes('mistake')) return 'common-mistakes'
  if (text.includes('mcq')) return 'quick-mcqs'
  if (text.includes('final')) return 'final-revision'

  return text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function flattenText(value: React.ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(flattenText).join(' ')
  }

  return ''
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  )
}
