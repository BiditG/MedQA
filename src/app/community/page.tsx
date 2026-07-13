import { CommunityHeader } from '@/components/community/CommunityPrimitives'
import { CommunityFeed } from '@/components/community/CommunityFeed'
import {
  getCommunityCategories,
  getCommunityPosts,
  type CommunityCategory,
  type CommunityPost,
} from '@/lib/community'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'CEE Doubt & Discussion Community',
  description:
    'A focused MEDQAS community for CEE doubts, daily questions, announcements, study progress, and moderated academic discussion.',
}

export default async function CommunityPage() {
  let categories: CommunityCategory[] = []
  let latest: CommunityPost[] = []
  let announcements: CommunityPost[] = []
  let dailyQuestion: CommunityPost | null = null
  let loadError = false

  try {
    const [categoryRows, latestRows, announcementRows, dailyRows] =
      await Promise.all([
        getCommunityCategories(),
        getCommunityPosts({ limit: 80 }),
        getCommunityPosts({
          categorySlug: 'medqas-announcements',
          pinnedOnly: true,
          limit: 4,
        }),
        getCommunityPosts({ dailyQuestionOnly: true, limit: 1 }),
      ])
    categories = categoryRows
    latest = latestRows
    announcements = announcementRows
    dailyQuestion = dailyRows[0] || null
  } catch {
    loadError = true
  }

  return (
    <main className="w-full">
      <CommunityHeader
        title="CEE Community"
        description="Focused doubts, daily questions, announcements, and study progress for CEE preparation."
        compact
      />

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        {loadError ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            Community data will appear after running
            <code className="mx-1 rounded bg-background px-1">
              sql/create-community.sql
            </code>
            in Supabase.
          </div>
        ) : null}
      </div>

      <CommunityFeed
        categories={categories}
        posts={latest}
        announcements={announcements}
        dailyQuestion={dailyQuestion}
      />
    </main>
  )
}
