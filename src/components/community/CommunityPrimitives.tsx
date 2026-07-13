import Link from 'next/link'
import {
  Atom,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  Dna,
  FlaskConical,
  HelpCircle,
  LineChart,
  Megaphone,
  MessageSquare,
  Sprout,
  Trophy,
} from 'lucide-react'
import type { CommunityCategory, CommunityPost } from '@/lib/community'
import { cn } from '@/utils/tailwind'

const icons = {
  Atom,
  Brain,
  CalendarCheck,
  ClipboardCheck,
  Dna,
  FlaskConical,
  HelpCircle,
  LineChart,
  Megaphone,
  Sprout,
  Trophy,
}

export function CommunityHeader({
  title,
  description,
  actions,
  compact = false,
}: {
  title: string
  description: string
  actions?: React.ReactNode
  compact?: boolean
}) {
  return (
    <section className="border-b bg-muted/20">
      <div
        className={cn(
          'mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8',
          compact ? 'py-4' : 'py-8',
        )}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            CEE Doubt & Discussion Community
          </p>
          <h1
            className={cn(
              'mt-2 font-semibold tracking-tight',
              compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl',
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              'max-w-2xl text-sm leading-6 text-muted-foreground',
              compact ? 'mt-1' : 'mt-3',
            )}
          >
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  )
}

export function CategoryGrid({
  categories,
}: {
  categories: CommunityCategory[]
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = icons[category.icon as keyof typeof icons] || MessageSquare
        return (
          <Link
            key={category.slug}
            href={`/community/category/${category.slug}`}
            className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/50"
          >
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background"
                style={{ color: category.color || undefined }}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold">
                  {category.name}
                </span>
                <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                  {category.description}
                </span>
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export function PostList({
  posts,
  emptyText = 'No discussions yet.',
}: {
  posts: CommunityPost[]
  emptyText?: string
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
        {emptyText}
      </div>
    )
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/community/post/${post.id}`}
          className="block p-4 transition-colors hover:bg-muted/30"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {post.is_pinned ? (
                  <StatusPill tone="blue">Pinned</StatusPill>
                ) : null}
                {post.is_verified_by_medqas ? (
                  <StatusPill tone="green">MEDQAS verified</StatusPill>
                ) : null}
                <StatusPill
                  tone={post.status === 'answered' ? 'green' : 'neutral'}
                >
                  {post.status}
                </StatusPill>
              </div>
              <h2 className="mt-2 text-base font-semibold leading-6">
                {post.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {post.body}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{post.category_slug.replaceAll('-', ' ')}</span>
                <span>{post.subject}</span>
                {post.topic ? <span>{post.topic}</span> : null}
                <span>{post.author_name || 'Student'}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-xs text-muted-foreground sm:text-right">
              <span>{post.reply_count} replies</span>
              <span>{post.view_count} views</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'green' | 'blue' | 'red'
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium capitalize',
        tone === 'green' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        tone === 'blue' && 'border-blue-200 bg-blue-50 text-blue-800',
        tone === 'red' && 'border-red-200 bg-red-50 text-red-800',
        tone === 'neutral' && 'bg-background text-muted-foreground',
      )}
    >
      {children}
    </span>
  )
}
