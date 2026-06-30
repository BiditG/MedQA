import Link from 'next/link'
import { ArrowRight, BookOpen, Search } from 'lucide-react'
import { PremiumGuard } from '@/components/PremiumGuard'
import {
  ceeGuideAccentClasses,
  ceeGuideExamPattern,
  ceeGuideNegativeMarking,
  ceeGuideSections,
} from '@/data/ceeGuide'
import { cn } from '@/utils/tailwind'

export const metadata = {
  title: 'CEE Guide',
  description:
    'CEE syllabus, study strategy, subject guides, and exam tips on MEDQAS.',
}

export default function CeeGuidePage() {
  return (
    <PremiumGuard>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Search className="h-3.5 w-3.5 text-primary" aria-hidden />
            Simple CEE study library
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            CEE Guide
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Pick a section, open an article, and move through the guide without
            noise. Everything is grouped by how students usually prepare.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="bg-background/85 overflow-hidden rounded-md border">
              <div className="border-b px-4 py-3 text-sm font-semibold">
                Marks allocation
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Subject</th>
                      <th className="px-4 py-3 font-semibold">Questions</th>
                      <th className="px-4 py-3 font-semibold">Marks</th>
                      <th className="px-4 py-3 font-semibold">Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ceeGuideExamPattern.map((item) => (
                      <tr key={item.subject}>
                        <td className="px-4 py-3 font-medium">
                          {item.subject}
                        </td>
                        <td className="px-4 py-3">{item.questions}</td>
                        <td className="px-4 py-3">{item.marks}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {item.tone}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-background/85 overflow-hidden rounded-md border">
              <div className="border-b px-4 py-3 text-sm font-semibold">
                Negative marking
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Result</th>
                    <th className="px-4 py-3 font-semibold">Effect</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ceeGuideNegativeMarking.map((item) => (
                    <tr key={item.result}>
                      <td className="px-4 py-3 font-medium">{item.result}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.effect}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          {ceeGuideSections.map((section) => (
            <article
              key={section.slug}
              className="rounded-lg border bg-background/90 p-4 shadow-sm"
            >
              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1',
                      ceeGuideAccentClasses[section.slug],
                    )}
                  >
                    <section.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold">{section.title}</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {section.articles.length} articles
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {section.description}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {section.articles.map((article) => (
                      <Link
                        key={article.slug.join('/')}
                        href={`/cee-guide/${article.slug.join('/')}`}
                        className="min-h-16 group flex items-start justify-between gap-3 rounded-md border bg-background px-3 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2 text-sm font-medium leading-5">
                            <BookOpen
                              className="h-4 w-4 shrink-0 text-primary"
                              aria-hidden
                            />
                            {article.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {article.readTime}
                          </span>
                        </span>
                        <ArrowRight
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </PremiumGuard>
  )
}
