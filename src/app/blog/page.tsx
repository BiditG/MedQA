import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Search,
  Sparkles,
} from 'lucide-react'
import { getPublishedBlogPosts, type BlogPost } from '@/lib/blog'

export const revalidate = 300

export const metadata = {
  title: 'CEE Blog Nepal: Syllabus, Books, Study Plan and MCQ Tips',
  description:
    'Read MEDQAS CEE Nepal guides for CEE syllabus 2026, best books for CEE Nepal, mock tests, study plans, and entrance preparation tips.',
  keywords: [
    'CEE syllabus 2026',
    'best books for CEE Nepal',
    'CEE Nepal preparation',
    'CEE mock test Nepal',
    'medical entrance Nepal',
  ],
}

export default async function BlogIndexPage() {
  let posts: BlogPost[] = []
  let loadError = false

  try {
    posts = await getPublishedBlogPosts()
  } catch {
    loadError = true
  }

  const featuredPost = posts[0]
  const remainingPosts = posts.slice(1)
  const targetKeywords = [
    'CEE syllabus 2026',
    'best books for CEE Nepal',
    'CEE mock test Nepal',
    'CEE preparation plan',
  ]

  return (
    <main className="w-full">
      <section className="border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Search className="h-3.5 w-3.5 text-primary" aria-hidden />
              CEE Nepal preparation blog
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-tight">
              CEE Blog Nepal: Syllabus 2026, Best Books, Mock Tests and Study
              Guides
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              MEDQAS publishes focused articles for CEE aspirants searching
              Google for exact topics like CEE syllabus 2026, best books for CEE
              Nepal, CEE mock tests, and medical entrance preparation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {targetKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border bg-background p-5 shadow-sm">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Why this blog exists</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Each article targets one clear search intent, answers it directly,
              and ends with one action: practice CEE questions on MEDQAS.
            </p>
            <Link
              href="/cee-mcqs"
              className="vibrant-btn mt-5 inline-flex items-center gap-2"
            >
              Try a free CEE mock quiz
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </aside>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {loadError ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Blog posts will appear after the Supabase `blog_posts` table is
            created and seeded.
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
            No published blog posts yet.
          </div>
        ) : (
          <div className="space-y-8">
            {featuredPost ? <FeaturedPost post={featuredPost} /> : null}

            {remainingPosts.length > 0 ? (
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <BookOpenCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">
                    More CEE preparation guides
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {remainingPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </main>
  )
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="grid overflow-hidden rounded-lg border bg-card shadow-sm lg:grid-cols-[1fr_320px]">
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <BookOpen className="h-4 w-4" aria-hidden />
            Featured CEE guide
          </span>
          {post.published_at ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {new Date(post.published_at).toLocaleDateString()}
            </span>
          ) : null}
        </div>
        <h2 className="mt-4 text-2xl font-semibold leading-8 sm:text-3xl sm:leading-10">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt ? (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {post.excerpt}
          </p>
        ) : null}
        <Link
          href={`/blog/${post.slug}`}
          className="vibrant-btn mt-5 inline-flex items-center gap-2"
        >
          Read the full guide
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div className="border-t bg-primary/5 p-5 lg:border-l lg:border-t-0">
        <h3 className="text-sm font-semibold">Search intent covered</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(post.keywords || []).slice(0, 5).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-center gap-2 text-xs font-medium text-primary">
        <BookOpen className="h-4 w-4" aria-hidden />
        {post.published_at
          ? new Date(post.published_at).toLocaleDateString()
          : 'MEDQAS Blog'}
      </div>
      <h2 className="mt-3 text-xl font-semibold leading-7">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}
      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        Read guide
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </article>
  )
}
