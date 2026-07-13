import { notFound } from 'next/navigation'
import { PostDetailClient } from '@/components/community/PostDetailClient'
import { getCommunityPost, getCommunityReplies } from '@/lib/community'

export const revalidate = 0

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getCommunityPost(params.id).catch(() => null)
  return {
    title: post?.title || 'Community discussion',
    description: post?.body?.slice(0, 150) || 'CEE community discussion',
  }
}

export default async function CommunityPostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await getCommunityPost(params.id).catch(() => null)
  if (!post) notFound()
  const replies = await getCommunityReplies(params.id).catch(() => [])

  return <PostDetailClient initialPost={post} initialReplies={replies} />
}
