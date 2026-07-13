import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  CommunityHeader,
  PostList,
} from '@/components/community/CommunityPrimitives'
import {
  getCommunityCategories,
  getCommunityPosts,
  type CommunityCategory,
  type CommunityPost,
} from '@/lib/community'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}) {
  const categories = await getCommunityCategories().catch(() => [])
  const category = categories.find((item) => item.slug === params.slug)
  return {
    title: category?.name || 'Community category',
    description: category?.description || 'CEE community discussions',
  }
}

export default async function CommunityCategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  let category: CommunityCategory | undefined
  let posts: CommunityPost[] = []

  try {
    const categories = await getCommunityCategories()
    category = categories.find((item) => item.slug === params.slug)
    if (!category) notFound()
    posts = await getCommunityPosts({ categorySlug: params.slug, limit: 50 })
  } catch {
    notFound()
  }

  return (
    <main className="w-full">
      <CommunityHeader
        title={category.name}
        description={
          category.description ||
          'Focused CEE discussion listing for this category.'
        }
        actions={
          <Button asChild>
            <Link href="/community/ask">Create post</Link>
          </Button>
        }
      />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <PostList posts={posts} emptyText="No posts in this category yet." />
      </div>
    </main>
  )
}
