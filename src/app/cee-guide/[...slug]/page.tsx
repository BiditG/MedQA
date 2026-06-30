import { readFile } from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import { PremiumGuard } from '@/components/PremiumGuard'
import {
  ceeGuideAccentClasses,
  ceeGuideArticles,
  getCeeGuideArticle,
} from '@/data/ceeGuide'
import { cn } from '@/utils/tailwind'

type PageProps = {
  params: {
    slug: string[]
  }
}

export function generateStaticParams() {
  return ceeGuideArticles.map((article) => ({
    slug: article.slug,
  }))
}

export function generateMetadata({ params }: PageProps) {
  const article = getCeeGuideArticle(params.slug)

  if (!article) {
    return {
      title: 'CEE Guide Article',
    }
  }

  return {
    title: `${article.title} | CEE Guide`,
    description: article.description,
  }
}

export default async function CeeGuideArticlePage({ params }: PageProps) {
  const article = getCeeGuideArticle(params.slug)
  if (!article) return notFound()

  const sectionArticles = article.section.articles
  const currentIndex = sectionArticles.findIndex(
    (item) => item.slug.join('/') === article.slug.join('/'),
  )
  const previousArticle = sectionArticles[currentIndex - 1]
  const nextArticle = sectionArticles[currentIndex + 1]
  const content = await readCeeGuideMdx(article)

  return (
    <PremiumGuard>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/cee-guide"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          CEE Guide
        </Link>

        <article className="mt-6 rounded-lg border bg-background/95 shadow-sm">
          <header className="border-b p-5 sm:p-7">
            <div
              className={cn(
                'mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1',
                ceeGuideAccentClasses[article.accent],
              )}
            >
              {article.section.title}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {article.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {article.readTime}
            </div>
          </header>

          <div className="p-5 sm:p-7">
            <div className="cee-guide-mdx">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="mt-8 text-2xl font-semibold first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-8 text-xl font-semibold first:mt-0">
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
                  ul: ({ children }) => (
                    <ul className="mt-4 grid gap-3">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mt-4 grid list-decimal gap-3 pl-5">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="rounded-md border bg-background p-4 text-sm leading-6">
                      {children}
                    </li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote
                      className={cn(
                        'mt-5 rounded-lg border p-4 text-sm leading-6 ring-1',
                        ceeGuideAccentClasses[article.accent],
                      )}
                    >
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
                      <table className="w-full text-left text-sm">
                        {children}
                      </table>
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
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {(previousArticle || nextArticle) && (
              <nav className="grid gap-3 border-t pt-5 sm:grid-cols-2">
                {previousArticle ? (
                  <Link
                    href={`/cee-guide/${previousArticle.slug.join('/')}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-3 text-sm hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        Previous
                      </span>
                      <span className="block truncate font-medium">
                        {previousArticle.title}
                      </span>
                    </span>
                  </Link>
                ) : null}

                {nextArticle ? (
                  <Link
                    href={`/cee-guide/${nextArticle.slug.join('/')}`}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-3 text-sm hover:bg-muted sm:text-right"
                  >
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">
                        Next
                      </span>
                      <span className="block truncate font-medium">
                        {nextArticle.title}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                ) : null}
              </nav>
            )}
          </div>
        </article>
      </main>
    </PremiumGuard>
  )
}

async function readCeeGuideMdx(article: {
  slug: string[]
  contentPath?: string[]
}) {
  const contentRoot = path.join(process.cwd(), 'content', 'cee-guide')
  const { slug } = article
  const slugPath = path.join(...slug)
  const candidates = article.contentPath
    ? [path.join(contentRoot, ...article.contentPath)]
    : slug.length === 1
      ? [path.join(contentRoot, slugPath, 'index.mdx')]
      : [
          path.join(
            contentRoot,
            ...slug.slice(0, -1),
            `${slug[slug.length - 1]}.mdx`,
          ),
          path.join(contentRoot, slugPath, 'index.mdx'),
        ]

  for (const fullPath of candidates) {
    try {
      return await readFile(fullPath, 'utf8')
    } catch {
      // Try the next conventional MDX location.
    }
  }

  notFound()
}
