'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bookmark,
  CheckCircle2,
  Clock3,
  Eye,
  MessageSquare,
  Pin,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  communityCategories,
  postTypes,
  subjects,
  type CommunityCategory,
  type CommunityPost,
} from '@/lib/community'
import { StatusPill } from './CommunityPrimitives'

type SortMode = 'latest' | 'answered' | 'unanswered' | 'popular'

export function CommunityFeed({
  categories,
  posts,
  announcements,
  dailyQuestion,
}: {
  categories: CommunityCategory[]
  posts: CommunityPost[]
  announcements: CommunityPost[]
  dailyQuestion: CommunityPost | null
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [categorySlug, setCategorySlug] = useState('all')
  const [subject, setSubject] = useState('all')
  const [postType, setPostType] = useState('all')
  const [sortMode, setSortMode] = useState<SortMode>('latest')

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return posts
      .filter((post) => {
        if (categorySlug !== 'all' && post.category_slug !== categorySlug) {
          return false
        }
        if (subject !== 'all' && post.subject !== subject) return false
        if (postType !== 'all' && post.post_type !== postType) return false
        if (!normalizedQuery) return true

        const haystack = [
          post.title,
          post.body,
          post.subject,
          post.topic,
          post.category_slug,
          post.post_type,
          ...(post.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return haystack.includes(normalizedQuery)
      })
      .filter((post) => {
        if (sortMode === 'answered') return post.status === 'answered'
        if (sortMode === 'unanswered') return post.status === 'open'
        return true
      })
      .sort((a, b) => {
        if (sortMode === 'popular') {
          return (
            b.reply_count +
            b.upvote_count +
            b.view_count -
            (a.reply_count + a.upvote_count + a.view_count)
          )
        }

        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      })
  }, [categorySlug, postType, posts, query, sortMode, subject])

  const activeFilterCount = [
    categorySlug !== 'all',
    subject !== 'all',
    postType !== 'all',
    sortMode !== 'latest',
    Boolean(query.trim()),
  ].filter(Boolean).length

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
      <section className="min-w-0">
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="pl-9"
                  placeholder="Search doubts, topics, tags, or subjects"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.refresh()}
              >
                Refresh
              </Button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect
                label="Category"
                value={categorySlug}
                onChange={setCategorySlug}
                options={[
                  { label: 'All categories', value: 'all' },
                  ...communityCategories.map((category) => ({
                    label: category.name,
                    value: category.slug,
                  })),
                ]}
              />
              <FilterSelect
                label="Subject"
                value={subject}
                onChange={setSubject}
                options={[
                  { label: 'All subjects', value: 'all' },
                  ...subjects.map((item) => ({ label: item, value: item })),
                ]}
              />
              <FilterSelect
                label="Type"
                value={postType}
                onChange={setPostType}
                options={[
                  { label: 'All post types', value: 'all' },
                  ...postTypes.map((item) => ({ label: item, value: item })),
                ]}
              />
              <FilterSelect
                label="Sort"
                value={sortMode}
                onChange={(value) => setSortMode(value as SortMode)}
                options={[
                  { label: 'Latest first', value: 'latest' },
                  { label: 'Answered', value: 'answered' },
                  { label: 'Unanswered', value: 'unanswered' },
                  { label: 'Most active', value: 'popular' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              Latest posts
              {activeFilterCount > 0 ? (
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {activeFilterCount} filter{activeFilterCount === 1 ? '' : 's'}
                </span>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">
              {filteredPosts.length} result
              {filteredPosts.length === 1 ? '' : 's'}
            </span>
          </div>

          <FeedPostList posts={filteredPosts} />
        </div>
      </section>

      <aside className="space-y-4">
        {dailyQuestion ? (
          <RailSection title="Daily CEE Question">
            <Link
              href={`/community/post/${dailyQuestion.id}`}
              className="block rounded-md border bg-background p-3 transition-colors hover:border-primary/50"
            >
              <h2 className="line-clamp-2 text-sm font-semibold leading-5">
                {dailyQuestion.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-5 text-muted-foreground">
                {dailyQuestion.body}
              </p>
            </Link>
          </RailSection>
        ) : null}

        <RailSection title="Pinned MEDQAS">
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pinned announcements yet.
            </p>
          ) : (
            <div className="space-y-2">
              {announcements.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/post/${post.id}`}
                  className="block rounded-md border bg-background p-3 text-sm transition-colors hover:border-primary/50"
                >
                  <span className="line-clamp-2 font-medium">{post.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </RailSection>

        <RailSection title="Browse Categories">
          <div className="grid gap-1">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/community/category/${category.slug}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/60"
              >
                <span className="truncate">{category.name}</span>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color || '#64748b' }}
                />
              </Link>
            ))}
          </div>
        </RailSection>

        <Link
          href="/community/my-posts"
          className="block rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:border-primary/50"
        >
          My posts
        </Link>
      </aside>
    </div>
  )
}

function FeedPostList({ posts }: { posts: CommunityPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-medium">No matching posts</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try clearing one filter or ask a focused CEE doubt.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/community/post/${post.id}`}
          className="block p-4 transition-colors hover:bg-muted/30"
        >
          <article>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {post.is_pinned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700">
                      <Pin className="h-3.5 w-3.5" aria-hidden />
                      Pinned
                    </span>
                  ) : null}
                  {post.status === 'answered' ? (
                    <StatusPill tone="green">Answered</StatusPill>
                  ) : (
                    <StatusPill>Open</StatusPill>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {post.post_type}
                  </span>
                </div>
                <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-6">
                  {post.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {post.body}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {post.subject}
                  </span>
                  <span>{categoryLabel(post.category_slug)}</span>
                  {post.topic ? <span>{post.topic}</span> : null}
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                <Metric icon={MessageSquare} value={post.reply_count} />
                <Metric icon={Eye} value={post.view_count} />
                {post.is_verified_by_medqas ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Metric({
  icon: Icon,
  value,
}: {
  icon: typeof Bookmark
  value: number
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-4 w-4" aria-hidden />
      {value}
    </span>
  )
}

function categoryLabel(slug: string) {
  return slug.replaceAll('-', ' ')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}
