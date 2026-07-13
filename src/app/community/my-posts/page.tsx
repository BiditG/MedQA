import { CommunityHeader } from '@/components/community/CommunityPrimitives'
import { MyPostsClient } from '@/components/community/MyPostsClient'

export const metadata = {
  title: 'My Community Posts',
}

export default function MyCommunityPostsPage() {
  return (
    <main className="w-full">
      <CommunityHeader
        title="My Posts"
        description="Track your own CEE doubts, answered and unanswered posts, replies, and saved discussions."
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <MyPostsClient />
      </div>
    </main>
  )
}
