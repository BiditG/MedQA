import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import { PremiumGuard } from '@/components/PremiumGuard'
import { getCommunityPosts, type CommunityPost } from '@/lib/community'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'MEDQAS Announcements',
  description:
    'Official MEDQAS announcements for CEE students, including new notes, mock tests, updates, and important notices.',
}

export default async function AnnouncementsPage() {
  let announcements: CommunityPost[] = []
  let loadError = false

  try {
    announcements = await getCommunityPosts({
      postType: 'Announcement',
      limit: 50,
    })
  } catch {
    loadError = true
  }

  return (
    <PremiumGuard>
      <main className="w-full">
        <section className="border-b bg-muted/20">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-primary">
                <Megaphone className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  MEDQAS Announcements
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Official updates, new notes, mock tests, and CEE notices.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          {loadError ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              Announcements will appear after the community Supabase schema is
              applied.
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              No announcements yet.
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {announcements.map((post) => (
                <article key={post.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {post.is_pinned ? (
                          <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 font-medium text-blue-800">
                            Pinned
                          </span>
                        ) : null}
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span>{post.author_name || 'MEDQAS Team'}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-semibold leading-7">
                        {post.title}
                      </h2>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {post.body}
                      </p>
                    </div>
                    <Link
                      href={`/community/post/${post.id}`}
                      className="shrink-0 text-sm font-medium text-primary hover:underline"
                    >
                      Discuss
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </PremiumGuard>
  )
}
