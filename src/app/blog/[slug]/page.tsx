import Link from 'next/link'
import type React from 'react'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ListChecks,
} from 'lucide-react'
import {
  getBlogSlugs,
  getPublishedBlogPost,
  getPublishedBlogPosts,
  type BlogPost,
} from '@/lib/blog'

export const revalidate = 300

export async function generateStaticParams() {
  const slugs = await getBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPublishedBlogPost(params.slug)
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    keywords: post.keywords || undefined,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || undefined,
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getPublishedBlogPost(params.slug)
  const posts = await getPublishedBlogPosts()
  const relatedPosts = posts
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3)
  const markdown = normalizeMarkdown(post.content)
  const headings = getMarkdownHeadings(markdown)
  const jsonLd = [buildArticleJsonLd(post), buildBreadcrumbJsonLd(post)]

  return (
    <main className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            CEE Blog
          </Link>

          <header className="mt-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-primary">
                <BookOpen className="h-4 w-4" aria-hidden />
                {post.author_name || 'MEDQAS Team'}
              </span>
              {post.published_at ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  Updated {new Date(post.published_at).toLocaleDateString()}
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {post.excerpt}
              </p>
            ) : null}
            {post.keywords?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.keywords.slice(0, 6).map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </header>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_280px] lg:px-8">
        <article className="min-w-0">
          <div className="mb-6 rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm leading-6 text-muted-foreground">
                Quick answer: this MEDQAS guide directly covers{' '}
                <strong className="font-semibold text-foreground">
                  {post.meta_title || post.title}
                </strong>{' '}
                for CEE aspirants in Nepal, then points you to CEE MCQ practice.
              </p>
            </div>
          </div>

          <div className="mt-8 max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2
                    id={slugify(childrenToText(children))}
                    className="mb-4 mt-8 scroll-mt-24 text-3xl font-semibold tracking-tight"
                  >
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2
                    id={slugify(childrenToText(children))}
                    className="mb-4 mt-9 scroll-mt-24 border-b pb-2 text-2xl font-semibold tracking-tight"
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    id={slugify(childrenToText(children))}
                    className="mb-3 mt-7 scroll-mt-24 text-xl font-semibold"
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="my-4 text-base leading-8 text-muted-foreground">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="my-5 list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-5 list-decimal space-y-2 pl-6 text-base leading-7 text-muted-foreground">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="pl-1">{children}</li>,
                strong: ({ children }) => (
                  <strong className="font-semibold text-foreground">
                    {children}
                  </strong>
                ),
                a: ({ href, children }) => (
                  <Link
                    href={href || '#'}
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    {children}
                  </Link>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="my-6 border-l-4 border-primary/40 bg-primary/5 px-4 py-3 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="my-6 overflow-x-auto rounded-lg border">
                    <table className="w-full border-collapse text-left text-sm">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border-b bg-muted/60 px-4 py-3 font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b px-4 py-3 text-muted-foreground">
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">
                    {children}
                  </code>
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>

          <section className="mt-10 rounded-lg border bg-primary/5 p-5 sm:p-6">
            <h2 className="text-xl font-semibold">
              Ready to practice CEE questions?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Turn this guide into exam practice with MEDQAS CEE MCQs and mock
              quiz tools.
            </p>
            <Link
              href={post.cta_href || '/cee-mcqs'}
              className="vibrant-btn mt-4 inline-flex items-center gap-2"
            >
              {post.cta_label || 'Try a free CEE mock quiz on MEDQAS'}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {headings.length ? (
            <section className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ListChecks className="h-4 w-4 text-primary" aria-hidden />
                In this guide
              </div>
              <nav className="mt-3 space-y-2">
                {headings.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className="block text-sm leading-5 text-muted-foreground hover:text-foreground"
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </section>
          ) : null}

          {relatedPosts.length ? (
            <section className="rounded-lg border bg-card p-4">
              <h2 className="text-sm font-semibold">Related CEE guides</h2>
              <div className="mt-3 space-y-3">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="block rounded-md border bg-background p-3 transition-colors hover:border-primary/40"
                  >
                    <span className="text-sm font-medium leading-5">
                      {item.title}
                    </span>
                    {item.excerpt ? (
                      <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">
                        {item.excerpt}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  )
}

function buildArticleJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    author: {
      '@type': 'Organization',
      name: post.author_name || 'MEDQAS',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MEDQAS',
    },
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    mainEntityOfPage: `/blog/${post.slug}`,
  }
}

function buildBreadcrumbJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'MEDQAS',
        item: '/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'CEE Blog',
        item: '/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `/blog/${post.slug}`,
      },
    ],
  }
}

function getMarkdownHeadings(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/, '').trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((text) => ({ text, id: slugify(text) }))
}

function normalizeMarkdown(markdown: string) {
  return markdown
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function childrenToText(children: React.ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(childrenToText).join(' ')
  }

  return ''
}
